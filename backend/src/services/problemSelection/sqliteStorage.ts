import { AppDataSource } from "../../config/database";
import { NormalizedProblem, ProblemState as ProblemStateType, ProblemStateStorage } from "./types";
import { ProblemState } from "../../models/ProblemState";

export class SQLiteProblemStateStorage implements ProblemStateStorage {
    async getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemStateType> {
        const repository = AppDataSource.getRepository(ProblemState);
        
        //console.log(`\nGetting problem state for user ${userId}, factors: ${normalized.smaller}x${normalized.larger}`);
        
        try {
            // Always store with smaller factor first for consistency
            const state = await repository
                .createQueryBuilder('state')
                .where(
                    'state.userId = :userId AND state.factor1 = :smaller AND state.factor2 = :larger',
                    { 
                        userId,
                        smaller: normalized.smaller,
                        larger: normalized.larger
                    }
                )
                .getOne();

            if (state) {
                //console.log('Found existing state:', state);
                return {
                    weight: state.weight,
                    lastSeen: state.lastSeen
                };
            }

            console.log('No existing state found, returning default');
            
            // FIXED: Use a constant default weight instead of factor product
            // This ensures all problems start at the same difficulty level
            const DEFAULT_WEIGHT = 10;
            
            // Return default state if none exists
            return {
                weight: DEFAULT_WEIGHT,
                lastSeen: 0
            };
        } catch (error) {
            console.error('Error getting problem state:', error);
            throw error;
        }
    }

    async updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemStateType): Promise<void> {
        const repository = AppDataSource.getRepository(ProblemState);
        
        console.log(`\nUpdating problem state for user ${userId}, factors: ${normalized.smaller}x${normalized.larger}`);
        console.log('New state:', state);
        
        try {
            // Always query with smaller factor first for consistency
            let problemState = await repository
                .createQueryBuilder('state')
                .where(
                    'state.userId = :userId AND state.factor1 = :smaller AND state.factor2 = :larger',
                    { 
                        userId,
                        smaller: normalized.smaller,
                        larger: normalized.larger
                    }
                )
                .getOne();

            if (!problemState) {
                console.log('Creating new problem state');
                // Create new state if none exists
                problemState = new ProblemState();
                problemState.userId = userId;
                // Always store with smaller factor first for consistency
                problemState.factor1 = normalized.smaller;
                problemState.factor2 = normalized.larger;
            } else {
                console.log('Updating existing problem state');
            }

            // Update state
            problemState.weight = state.weight;
            problemState.lastSeen = state.lastSeen;

            // Save to database
            const saved = await repository.save(problemState);
            console.log('Saved problem state:', saved);
        } catch (error) {
            console.error('Error updating problem state:', error);
            throw error;
        }
    }
}