import React, {useEffect, useState} from 'react';
import {IndexedDB} from "../types/hoodadak-client";
import {User} from "../types/hoodadak";
import useEffectOnce from "./useEffectOnce";

export default function useDatabaseData<T>(database: IndexedDB): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
    const [data, setData] = useState<T[]>([]);
    useEffect(() => {
        (async () => {
            const items = await database.getAll();
            setData(items);
        })();
    }, [database]);
    return [data, setData];
}