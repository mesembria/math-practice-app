import { AppDataSource } from "../../config/database";
import { ProblemStateStorage, ProblemStateData } from "./types";
import { ProblemState as DbProblemState } from "../../models/ProblemState";
import { NormalizedProblem, ProblemType } from "../../models/types";

export class SQLiteProblemStateStorage implements ProblemStateStorage {
    async getProblemState(userId: number, normalized: NormalizedProblem): Promise<ProblemStateData> {
        const repository = AppDataSource.getRepository(DbProblemState);
        
        try {
            // Query by userId, factors, problemType, AND missingOperandPosition
            const state = await repository
                .createQueryBuilder('state')
                .where(
                    'state.userId = :userId AND state.factor1 = :smaller AND state.factor2 = :larger AND state.problemType = :problemType',
                    { 
                        userId,
                        smaller: normalized.smaller,
                        larger: normalized.larger,
                        problemType: normalized.problemType
                    }
                )
                // Handle NULL vs. specific value for missingOperandPosition
                .andWhere(normalized.missingOperandPosition 
                    ? 'state.missingOperandPosition = :missingOperandPosition' 
                    : 'state.missingOperandPosition IS NULL', 
                    normalized.missingOperandPosition 
                        ? { missingOperandPosition: normalized.missingOperandPosition } 
                        : {})
                .getOne();

            if (state) {
                console.log(`Found existing state for problem type ${normalized.problemType}, missingOperandPosition ${normalized.missingOperandPosition || 'null'}:`, state);
                return {
                    weight: state.weight,
                    lastSeen: state.lastSeen,
                    problemType: state.problemType as ProblemType
                };
            }

            //console.log(`No existing state found for problem type ${normalized.problemType}, missingOperandPosition ${normalized.missingOperandPosition || 'null'}, returning default`);
            
            // Return default state with the correct problem type
            return {
                weight: 10,
                lastSeen: 0,
                problemType: normalized.problemType
            };
        } catch (error) {
            console.error('Error getting problem state:', error);
            throw error;
        }
    }

    async updateProblemState(userId: number, normalized: NormalizedProblem, state: ProblemStateData): Promise<void> {
        const repository = AppDataSource.getRepository(DbProblemState);
        
        console.log(`\nUpdating problem state for user ${userId}, factors: ${normalized.smaller}x${normalized.larger}, problemType: ${normalized.problemType}, missingOperandPosition: ${normalized.missingOperandPosition || 'null'}`);
        console.log('New state:', state);
        
        try {
            // Query with all relevant fields for a complete match
            let problemState = await repository
                .createQueryBuilder('state')
                .where(
                    'state.userId = :userId AND state.factor1 = :smaller AND state.factor2 = :larger AND state.problemType = :problemType',
                    { 
                        userId,
                        smaller: normalized.smaller,
                        larger: normalized.larger,
                        problemType: normalized.problemType
                    }
                )
                // Handle NULL vs. specific value for missingOperandPosition
                .andWhere(normalized.missingOperandPosition 
                    ? 'state.missingOperandPosition = :missingOperandPosition' 
                    : 'state.missingOperandPosition IS NULL', 
                    normalized.missingOperandPosition 
                        ? { missingOperandPosition: normalized.missingOperandPosition } 
                        : {})
                .getOne();

            if (!problemState) {
                console.log('Creating new problem state');
                // Create new state if none exists
                problemState = new DbProblemState();
                problemState.userId = userId;
                // Always store with smaller factor first for consistency
                problemState.factor1 = normalized.smaller;
                problemState.factor2 = normalized.larger;
                
                // IMPORTANT: Set the correct problem type and missing operand position
                problemState.problemType = state.problemType as string;
                // Convert undefined to null for proper type compatibility
                problemState.missingOperandPosition = normalized.missingOperandPosition || null;
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