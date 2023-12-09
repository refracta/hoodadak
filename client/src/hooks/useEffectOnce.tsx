import {DependencyList, EffectCallback, useEffect, useRef} from "react";

export default function useEffectOnce(effect: EffectCallback, deps?: DependencyList): void {
    const isExecuted = useRef(false);
    useEffect(() => {
        let callback: any;
        if (isExecuted.current) {
            callback = effect();
        }
        return () => {
            isExecuted.current = true;
            if (callback) {
                callback();
            }
        };
    }, deps);
}