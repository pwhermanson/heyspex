import type { Command } from './registry';
import { listCommands } from './registry';
import type {
   PaletteProvider,
   PaletteProviderSearchArgs,
   PaletteResult,
} from './provider-registry';
import { registerProvider } from './provider-registry';

const COMMANDS_GROUP_LABEL = 'Commands';
const EXACT_MATCH_BOOST = 1000;
const PREFIX_MATCH_BOOST = 800;
const SUBSTRING_MATCH_BOOST = 600;
const SUBSEQUENCE_BASE_SCORE = 400;

function normalize(value: string): string {
   return value.trim().toLowerCase();
}

function scoreCandidate(query: string, candidate: string): number | null {
   const normalizedCandidate = candidate.toLowerCase();

   if (!query) {
      return 0;
   }
   if (normalizedCandidate === query) {
      return EXACT_MATCH_BOOST;
   }
   if (normalizedCandidate.startsWith(query)) {
      return PREFIX_MATCH_BOOST - normalizedCandidate.length;
   }
   const substringIndex = normalizedCandidate.indexOf(query);
   if (substringIndex !== -1) {
      return SUBSTRING_MATCH_BOOST - substringIndex;
   }
   const subsequenceScore = scoreSubsequence(query, normalizedCandidate);
   if (subsequenceScore === null) {
      return null;
   }
   return Math.max(0, SUBSEQUENCE_BASE_SCORE - subsequenceScore);
}

function scoreSubsequence(query: string, candidate: string): number | null {
   let candidateIndex = 0;
   let penalty = 0;
   for (const char of query) {
      const matchIndex = candidate.indexOf(char, candidateIndex);
      if (matchIndex === -1) {
         return null;
      }
      penalty += matchIndex - candidateIndex;
      candidateIndex = matchIndex + 1;
   }
   return penalty;
}

function computeCommandScore(query: string, command: Command): number | null {
   if (!query) {
      return 0;
   }
   const candidates = [command.title, ...(command.keywords ?? [])];
   let bestScore: number | null = null;
   for (const candidate of candidates) {
      const score = scoreCandidate(query, candidate);
      if (score !== null && (bestScore === null || score > bestScore)) {
         bestScore = score;
      }
   }
   return bestScore;
}

function buildResult(command: Command, score: number): PaletteResult {
   return {
      id: command.id,
      title: command.title,
      group: COMMANDS_GROUP_LABEL,
      subtitle: command.keywords?.join(', '),
      icon: command.icon,
      shortcut: command.shortcut,
      score,
      onSelect: command.run,
   };
}

function searchCommands({ query, context, limit }: PaletteProviderSearchArgs): PaletteResult[] {
   const normalizedQuery = normalize(query);
   console.log('🔍 Search called with query:', query, 'normalized:', normalizedQuery);
   const commands = listCommands().filter((command) => command.guard?.(context) ?? true);
   console.log(
      '📋 Available commands:',
      commands.length,
      commands.map((c) => c.title)
   );

   // Test scoring specifically for "/" query
   if (query === '/') {
      commands.forEach((command) => {
         const score = computeCommandScore(normalizedQuery, command);
         console.log(`📝 Command "${command.title}" score for "/":`, score);
      });
   }

   const resultsWithScore = commands
      .map((command) => {
         const score = computeCommandScore(normalizedQuery, command);
         return score === null ? null : { command, score };
      })
      .filter((value): value is { command: Command; score: number } => value !== null);

   if (!normalizedQuery) {
      resultsWithScore.sort((a, b) => a.command.title.localeCompare(b.command.title));
   } else {
      resultsWithScore.sort((a, b) => {
         if (b.score !== a.score) {
            return b.score - a.score;
         }
         return a.command.title.localeCompare(b.command.title);
      });
   }

   const limitedResults =
      typeof limit === 'number' && limit > 0 ? resultsWithScore.slice(0, limit) : resultsWithScore;

   const results = limitedResults.map(({ command, score }) => buildResult(command, score));
   console.log(
      '📤 Returning results:',
      results.length,
      results.map((r) => ({ title: r.title, score: r.score }))
   );
   return results;
}

const commandsProvider: PaletteProvider = {
   id: 'commands',
   label: COMMANDS_GROUP_LABEL,
   priority: 100,
   search: (args) => searchCommands(args),
   getInitialResults: (context) =>
      searchCommands({
         context,
         query: '',
      }),
};

registerProvider(commandsProvider);

// Debug: Log all registered commands on startup
console.log('🚀 Commands Provider: Registering commands...');
setTimeout(() => {
   const allCommands = listCommands();
   console.log(
      '📋 All registered commands:',
      allCommands.length,
      allCommands.map((c) => ({ id: c.id, title: c.title }))
   );
}, 100);

export { commandsProvider };
