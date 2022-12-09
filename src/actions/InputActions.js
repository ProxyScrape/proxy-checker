import findMixedProxies from '../misc/FindMixedProxies.js';
import { readFile } from 'fs/promises';
import { ipcRenderer } from 'electron';
import { uniq } from '../misc/array';
import { INPUT_SET_LOADED_FILE_DATA } from '../constants/ActionTypes';
import { parse } from 'path';
import { LiveChatWidget } from '@livechat/widget-react';

export const setLoadedData = nextState => ({
    type: INPUT_SET_LOADED_FILE_DATA,
    nextState
});

const getResult = (text, event, getState) => {
    try {
        // if (event.ctrlKey) {
        //     const { input } = getState();

        //     const totalLines = text.split(/\r?\n/).filter(item => item.length > 0);
        //     const uniqueLines = uniq([...totalLines, ...input.list]);
        //     console.log(uniqueLines);
        //     const { successed: list, failed: errors } = findMixedProxies(uniqueLines);

        //     return {
        //         list,
        //         errors,
        //         total: totalLines.length + input.list.length,
        //         unique: uniqueLines.length
        //     };
        // }
       
        const totalLines = text.split(/\r?\n/).filter(item => item.length > 0);
        const uniqueLines = uniq(totalLines);
        const { successed: list, failed: errors } = findMixedProxies(uniqueLines);

        return {
            list,
            errors,
            total: totalLines.length,
            unique: uniqueLines.length,
            size: text.length
        };
    } catch (error) {
        return {
            list: [],
            errors: [],
            total: 0,
            unique: 0
        };
    }
};

export const loadFromTxt = event => async (dispatch, getState) => {
 
    try {
        const paths = await ipcRenderer.invoke('choose-multi');

        if (paths) {
            let filesText;
            const names = [];

            for await (const path of paths) {
                filesText += await readFile(path, 'utf8');
                names.push(parse(path).base);
            }

            const { list, errors, total, unique, size } = getResult(filesText, event, getState);

            if (!list.length) throw new Error('No proxies found');

            dispatch(
                setLoadedData({
                    loaded: true,
                    list,
                    errors,
                    name: names.join(', '),
                    total,
                    unique,
                    size
                })
            );
        }
    } catch (error) {
        alert(error);
    }
};

export const checkProxy = event => async (dispatch, getState) => {
    

    try {
        
        if (event.target.dataset.file != "") {
            let filesText;
            const names = [];
            let path = `${process.env.USERPROFILE}\\Downloads\\` + event.target.dataset.file;

            filesText = await readFile(path, 'utf8');
            names.push(parse(path).base);
        

            const { list, errors, total, unique, size } = getResult(filesText, event, getState);

            if (!list.length) throw new Error('No proxies found');

            dispatch(
                setLoadedData({
                    loaded: true,
                    list,
                    errors,
                    name: names.join(', '),
                    total,
                    unique,
                    size
                })
            );
        }
    } catch (error) {
        alert(error);
    }
};

export const overrideEventDefaults = event => async (dispatch, getState) => {
    try {
        event.preventDefault();
        event.stopPropagation();
    } catch (error) {
        alert(error);
    }
};

export const onFileDrop = event => async (dispatch, getState) => {
    
    try {
            event.preventDefault();
            event.stopPropagation();

   
            if (event.dataTransfer.files.length) {
                
                let filesText;
                const names = [];

                for await (const file of event.dataTransfer.files) {
                    filesText += await readFile(file.path, 'utf8');
                    names.push(parse(file.path).base);
                }

                const { list, errors, total, unique, size } = getResult(filesText, event, getState);

                if (!list.length) throw new Error('No proxies found');

                dispatch(
                    setLoadedData({
                        loaded: true,
                        list,
                        errors,
                        name: names.join(', '),
                        total,
                        unique,
                        size
                    })
                );
            }
        
    } catch (error) {
        alert(error);
    }
};

export const pasteFromClipboard = event => async (dispatch, getState) => {
    try {
        const text = await navigator.clipboard.readText();
        const { list, errors, total, unique, size } = getResult(text, event, getState);

        if (!list.length) throw new Error('No proxies found');

        dispatch(
            setLoadedData({
                loaded: true,
                list,
                errors,
                name: 'Clipboard',
                total,
                unique,
                size
            })
        );
    } catch (error) {
        alert(error);
    }
};
