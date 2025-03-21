import mongoose, { Schema, Document } from 'mongoose';

export interface IAttackPattern extends Document {
  name: string;
  description: string;
  category: 'Prompt Injection' | 'Data Exfiltration' | 'Jailbreak' | 'Model Manipulation' | 'Boundary Testing' | 'Chain-of-thought' | 'Context Window' | 'Attack Chain';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  promptTemplate: string;
  variants: string[];
  detectionSignals: string[];
  prerequisites: string[];
  relatedPatterns: string[];
  tags: string[];
  references: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    targetModelTypes: string[];
    successRate?: number;
    complexity: 'Simple' | 'Moderate' | 'Complex';
    executionTime: number;
    resourceRequirements: {
      memory: string;
      cpu: string;
    };
  };
}

const attackPatternSchema = new Schema<IAttackPattern>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Prompt Injection', 'Data Exfiltration', 'Jailbreak', 'Model Manipulation', 'Boundary Testing', 'Chain-of-thought', 'Context Window', 'Attack Chain']
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical']
  },
  promptTemplate: { type: String, required: true },
  variants: [{ type: String }],
  detectionSignals: [{ type: String }],
  prerequisites: [{ type: String }],
  relatedPatterns: [{ type: String }],
  tags: [{ type: String }],
  references: [{ type: String }],
  metadata: {
    targetModelTypes: [{ type: String }],
    successRate: { type: Number },
    complexity: {
      type: String,
      enum: ['Simple', 'Moderate', 'Complex']
    },
    executionTime: { type: Number },
    resourceRequirements: {
      memory: { type: String },
      cpu: { type: String }
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
attackPatternSchema.index({ category: 1 });
attackPatternSchema.index({ severity: 1 });
attackPatternSchema.index({ tags: 1 });
attackPatternSchema.index({ 'metadata.targetModelTypes': 1 });

export const AttackPattern = mongoose.model<IAttackPattern>('AttackPattern', attackPatternSchema); 
