import axios from 'axios';
import { AttackPattern } from '../models/AttackPattern.js';
import { logger } from './logger.js';

interface MITREAttackPattern {
  id: string;
  name: string;
  description: string;
  type: string;
  severity: string;
  examples: string[];
  references: string[];
  kill_chain_phases?: Array<{phase_name: string}>;
  x_mitre_detection?: string[];
  x_mitre_prerequisites?: string[];
  x_mitre_related_techniques?: string[];
  x_mitre_attack_spec_version?: string;
  external_references?: Array<{url: string}>;
}

export class DataImportService {
  private static instance: DataImportService;
  private mitreAtlasUrl = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';
  
  // Valid categories, severities and complexities
  private readonly validCategories = [
    'Prompt Injection', 'Data Exfiltration', 'Jailbreak', 'Model Manipulation', 
    'Boundary Testing', 'Chain-of-thought', 'Context Window', 'Attack Chain'
  ];
  
  private readonly validSeverities = ['Low', 'Medium', 'High', 'Critical'];
  private readonly validComplexities = ['Simple', 'Moderate', 'Complex'];

  private constructor() {}

  public static getInstance(): DataImportService {
    if (!DataImportService.instance) {
      DataImportService.instance = new DataImportService();
    }
    return DataImportService.instance;
  }

  /**
   * Import MITRE ATT&CK patterns related to AI/ML
   */
  public async importMITREAttackPatterns(): Promise<void> {
    try {
      logger.info('Starting MITRE ATT&CK pattern import');
      
      // Fetch data from MITRE ATT&CK API
      const response = await this.fetchMITREData();
      
      // Filter for AI/ML relevant patterns
      const patterns = this.filterAIMLPatterns(response.data.objects);
      logger.info(`Found ${patterns.length} AI/ML relevant patterns`);
      
      // Process patterns in batches
      await this.processMITREPatterns(patterns);
      
      logger.info('MITRE ATT&CK pattern import completed successfully');
    } catch (error) {
      logger.error('Error importing MITRE attack patterns:', error);
      throw error;
    }
  }

  /**
   * Fetch data from MITRE ATT&CK API
   */
  private async fetchMITREData(): Promise<any> {
    try {
      const response = await axios.get(this.mitreAtlasUrl);
      
      if (!response.data || !response.data.objects) {
        throw new Error('Invalid response format from MITRE ATT&CK API');
      }
      
      logger.info(`Received ${response.data.objects.length} total objects from MITRE ATT&CK`);
      
      // Simple logging of first object
      if (response.data.objects.length > 0) {
        const firstObj = response.data.objects[0];
        logger.info('First object type: ' + firstObj.type);
        logger.info('First object name: ' + firstObj.name);
        logger.info('First object description length: ' + (firstObj.description?.length || 0));
      }
      
      return response;
    } catch (error) {
      logger.error('Error fetching data from MITRE ATT&CK API:', error);
      throw error;
    }
  }

  /**
   * Filter for AI/ML relevant patterns
   */
  private filterAIMLPatterns(objects: any[]): MITREAttackPattern[] {
    return objects.filter((obj: any) => 
      obj.type === 'attack-pattern' && 
      obj.description && (
        obj.description.toLowerCase().includes('ai') || 
        obj.description.toLowerCase().includes('machine learning') ||
        obj.description.toLowerCase().includes('model') ||
        obj.description.toLowerCase().includes('neural network')
      )
    );
  }

  /**
   * Process MITRE patterns in batches
   */
  private async processMITREPatterns(patterns: MITREAttackPattern[]): Promise<void> {
    // Process patterns in batches with a reasonable batch size
    const batchSize = 5;
    
    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);
      logger.info(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(patterns.length/batchSize)}`);

      // Process each pattern in the batch
      const promises = batch.map(pattern => this.processSingleMITREPattern(pattern));
      
      // Wait for all patterns in the batch to be processed
      const results = await Promise.allSettled(promises);
      
      // Log any failures
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          logger.error(`Failed to process pattern at index ${i + index}:`, result.reason);
        }
      });

      // Add a delay between batches to prevent overwhelming the database
      if (i + batchSize < patterns.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Process a single MITRE pattern with database retry logic
   */
  private async processSingleMITREPattern(pattern: MITREAttackPattern): Promise<void> {
    try {
      // Log the pattern we're about to process
      logger.info(`Processing pattern: ${pattern.name}`);
      
      // Validate required fields
      if (!pattern.name || !pattern.description) {
        logger.error(`Pattern missing required fields: ${pattern.id}`);
        return;
      }

      // Map and validate fields
      const category = this.mapMITRECategory(pattern.kill_chain_phases?.[0]?.phase_name || 'unknown');
      const severity = this.assessSeverity(pattern);
      const complexity = this.assessComplexity(pattern);
      
      // Skip patterns with invalid fields
      if (!this.validateFields(pattern.name, category, severity, complexity)) {
        return;
      }

      // Prepare the attack pattern data
      const attackPatternData = this.prepareMITREAttackPatternData(pattern, category, severity, complexity);

      // Save to database with retry logic
      await this.saveToDatabase(pattern.name, attackPatternData);
      
      logger.info(`Successfully imported/updated MITRE attack pattern: ${pattern.name}`);
    } catch (error) {
      logger.error(`Error processing MITRE pattern ${pattern.name}:`, error);
      throw error; // Rethrow so Promise.allSettled can catch it
    }
  }

  /**
   * Validate that fields meet our requirements
   */
  private validateFields(name: string, category: string, severity: string, complexity: string): boolean {
    if (!this.validCategories.includes(category)) {
      logger.error(`Invalid category ${category} for pattern ${name}`);
      return false;
    }

    if (!this.validSeverities.includes(severity)) {
      logger.error(`Invalid severity ${severity} for pattern ${name}`);
      return false;
    }

    if (!this.validComplexities.includes(complexity)) {
      logger.error(`Invalid complexity ${complexity} for pattern ${name}`);
      return false;
    }

    return true;
  }

  /**
   * Prepare MITRE attack pattern data
   */
  private prepareMITREAttackPatternData(pattern: MITREAttackPattern, category: string, severity: string, complexity: string): any {
    return {
      name: pattern.name,
      description: pattern.description,
      category: category,
      severity: severity,
      promptTemplate: this.extractPromptTemplate(pattern.x_mitre_detection || []),
      variants: pattern.x_mitre_detection || [],
      detectionSignals: this.extractDetectionSignals(pattern.description),
      prerequisites: pattern.x_mitre_prerequisites || [],
      relatedPatterns: pattern.x_mitre_related_techniques || [],
      tags: this.extractTags(pattern),
      references: pattern.external_references?.map((ref: any) => ref.url) || [],
      metadata: {
        targetModelTypes: this.extractTargetModels(pattern),
        complexity: complexity,
        executionTime: this.estimateExecutionTime(pattern),
        resourceRequirements: this.estimateResourceRequirements(pattern)
      }
    };
  }

  /**
   * Save to database with retry logic
   */
  private async saveToDatabase(name: string, data: any, maxRetries = 3): Promise<void> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await AttackPattern.findOneAndUpdate(
          { name: name },
          data,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        );
        return; // Success, exit the function
      } catch (error) {
        lastError = error;
        
        // Check if it's a database error that might be resolved by retrying
        const isRetryableError = 
          error instanceof Error && (
            error.name === 'MongooseError' ||
            error.name === 'MongoError' ||
            error.name === 'MongoServerError' ||
            error.message.includes('timed out')
          );
        
        if (isRetryableError && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.warn(`Database operation failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error; // Not retryable or max retries reached
        }
      }
    }
    
    throw lastError; // This should never be reached but is here for completeness
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        const retryDelay = attempt * 2000; // Exponential backoff
        logger.warn(`Database operation failed, retrying in ${retryDelay}ms (attempt ${attempt}/${maxRetries}) ${error.message}`, {
          stack: error.stack
        });
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          logger.error(`Operation failed after ${maxRetries} attempts`, { 
            error: error.message,
            stack: error.stack
          });
        }
      }
    }
    
    if (lastError) {
      logger.error('All retry attempts failed', { error: lastError });
      throw lastError; // This should never be reached but is here for completeness
    }
    
    throw new Error('Unexpected error in retry operation'); // This should never be reached
  }

  private mapMITRECategory(type: string): string {
    const categoryMap: { [key: string]: string } = {
      'initial-access': 'Prompt Injection',
      'execution': 'Model Manipulation',
      'persistence': 'Jailbreak',
      'privilege-escalation': 'Jailbreak',
      'defense-evasion': 'Model Manipulation',
      'credential-access': 'Data Exfiltration',
      'discovery': 'Boundary Testing',
      'lateral-movement': 'Attack Chain',
      'collection': 'Data Exfiltration',
      'exfiltration': 'Data Exfiltration',
      'command-and-control': 'Model Manipulation',
      'impact': 'Model Manipulation'
    };
    return categoryMap[type.toLowerCase()] || 'Model Manipulation';
  }

  private mapMITRESeverity(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'critical': 'Critical',
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low'
    };
    return severityMap[severity.toLowerCase()] || 'Medium';
  }

  private extractPromptTemplate(examples: string[]): string {
    if (!examples || examples.length === 0) return '';
    // Extract common patterns from examples to create a template
    return examples[0]; // Simplified for now
  }

  private extractDetectionSignals(description: string): string[] {
    // Extract potential detection signals from description
    return description.split('.').filter(sentence => 
      sentence.toLowerCase().includes('detect') || 
      sentence.toLowerCase().includes('indicator') ||
      sentence.toLowerCase().includes('signal')
    );
  }

  private extractTags(pattern: any): string[] {
    const tags = new Set<string>();
    
    // Add tags from kill chain phases
    if (pattern.kill_chain_phases) {
      pattern.kill_chain_phases.forEach((phase: any) => {
        if (phase.phase_name) tags.add(phase.phase_name.toLowerCase());
      });
    }

    // Add tags from tactics
    if (pattern.x_mitre_attack_spec_version) {
      tags.add('mitre');
      tags.add('attack');
    }

    // Extract additional tags from description
    if (pattern.description) {
      const words = pattern.description.toLowerCase().split(/\s+/);
      words.forEach((word: string) => {
        if (word.length > 3 && !this.isCommonWord(word)) {
          tags.add(word);
        }
      });
    }

    return Array.from(tags);
  }

  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
      'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would',
      'there', 'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when', 'make',
      'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
      'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
      'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
      'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want'
    ]);
    return commonWords.has(word);
  }

  private extractTargetModels(pattern: MITREAttackPattern): string[] {
    // Extract target model types from pattern description
    const models = new Set<string>();
    if (pattern.description.toLowerCase().includes('llm')) models.add('LLM');
    if (pattern.description.toLowerCase().includes('gpt')) models.add('GPT');
    if (pattern.description.toLowerCase().includes('bert')) models.add('BERT');
    return Array.from(models);
  }

  private assessComplexity(pattern: any): string {
    const descriptionLength = pattern.description?.length || 0;
    const examples = pattern.examples || pattern.x_mitre_detection || [];
    const examplesCount = examples.length;
    
    if (descriptionLength < 200 && examplesCount <= 2) return 'Simple';
    if (descriptionLength < 500 && examplesCount <= 5) return 'Moderate';
    return 'Complex';
  }

  private estimateExecutionTime(pattern: MITREAttackPattern): number {
    // Simple estimation based on complexity
    const complexity = this.assessComplexity(pattern);
    switch (complexity) {
      case 'Simple': return 1;
      case 'Moderate': return 3;
      case 'Complex': return 5;
      default: return 3;
    }
  }

  private estimateResourceRequirements(pattern: MITREAttackPattern): { memory: string; cpu: string } {
    const complexity = this.assessComplexity(pattern);
    switch (complexity) {
      case 'Simple':
        return { memory: '1GB', cpu: '1' };
      case 'Moderate':
        return { memory: '2GB', cpu: '2' };
      case 'Complex':
        return { memory: '4GB', cpu: '4' };
      default:
        return { memory: '2GB', cpu: '2' };
    }
  }

  private assessSeverity(pattern: any): string {
    // Default to Medium if we can't assess severity
    if (!pattern) return 'Medium';

    // Check for explicit severity indicators in description
    const description = pattern.description?.toLowerCase() || '';
    if (description.includes('critical') || description.includes('severe')) return 'Critical';
    if (description.includes('high')) return 'High';
    if (description.includes('low')) return 'Low';

    // Check prerequisites count
    const prerequisites = pattern.x_mitre_prerequisites || [];
    if (prerequisites.length === 0) return 'Critical';
    if (prerequisites.length <= 2) return 'High';
    if (prerequisites.length <= 4) return 'Medium';
    return 'Low';
  }
} 
