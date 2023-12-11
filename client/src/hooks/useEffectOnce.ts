import {DependencyList, useEffect, useRef} from "react";

declare const UNDEFINED_VOID_ONLY: unique symbol;
type Destructor = () => void | { [UNDEFINED_VOID_ONLY]: never };
type EffectResult = void | boolean | Destructor | {
    destructor: Destructor,
    status: boolean
}

export default function useEffectOnce(effect: () => EffectResult, deps?: DependencyList): void {
    const isExecuted = useRef(false);
    useEffect(() => {
        let effectResult: EffectResult;
        let destructor: Destructor;
        let status = true;
        if (!isExecuted.current) {
            effectResult = effect();
            if (typeof effectResult === 'boolean') {
                status = effectResult;
            } else if (typeof effectResult === 'function') {
                destructor = effectResult;
            } else if (typeof effectResult?.destructor === 'function') {
                destructor = effectResult.destructor;
                status = effectResult.status;
            }
        }

        return () => {
            isExecuted.current = status;
            if (destructor) {
                destructor();
            }
        };
    }, deps);
}