import type { ExtractionOutput } from './extraction-schema';

export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  extractRequirements(announcementText: string): Promise<ExtractionOutput>;
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerName: string) {
    super(
      `LLM provider "${providerName}" is not configured. ` +
        'Please set the required environment variables.'
    );
    this.name = 'ProviderNotConfiguredError';
  }
}

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'ExtractionError';
  }
}
