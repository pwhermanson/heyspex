/**
 * Zone State Machine
 *
 * Provides elegant state management for workspace zones with configurable state cycles
 */

export type StateMachineConfig<T> = {
   states: T[];
   initialState: T;
   transitions: Record<T, T>;
};

export class StateMachine<T extends string> {
   private currentState: T;
   private config: StateMachineConfig<T>;

   constructor(config: StateMachineConfig<T>) {
      this.config = config;
      this.currentState = config.initialState;
   }

   getCurrentState(): T {
      return this.currentState;
   }

   transition(): T {
      const nextState = this.config.transitions[this.currentState];
      this.currentState = nextState;
      return this.currentState;
   }

   setState(state: T): void {
      if (this.config.states.includes(state)) {
         this.currentState = state;
      }
   }

   canTransitionTo(state: T): boolean {
      return this.config.states.includes(state);
   }
}

// Predefined zone state machines
export const createWorkspaceZoneAStateMachine = () =>
   new StateMachine({
      states: ['normal', 'fullscreen', 'hidden'],
      initialState: 'normal',
      transitions: {
         normal: 'fullscreen',
         fullscreen: 'hidden',
         hidden: 'normal',
      },
   });

export const createWorkspaceZoneBStateMachine = () =>
   new StateMachine({
      states: ['push', 'overlay'],
      initialState: 'push',
      transitions: {
         push: 'overlay',
         overlay: 'push',
      },
   });

// React hook for state machines
export function useStateMachine<T extends string>(config: StateMachineConfig<T>) {
   const [stateMachine] = useState(() => new StateMachine(config));
   const [currentState, setCurrentState] = useState(config.initialState);

   const transition = useCallback(() => {
      const newState = stateMachine.transition();
      setCurrentState(newState);
      return newState;
   }, [stateMachine]);

   const setState = useCallback(
      (state: T) => {
         stateMachine.setState(state);
         setCurrentState(state);
      },
      [stateMachine]
   );

   return {
      currentState,
      transition,
      setState,
      canTransitionTo: stateMachine.canTransitionTo.bind(stateMachine),
   };
}
