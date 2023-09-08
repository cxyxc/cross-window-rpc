declare class WindowRPC {
    constructor(name: string, debug?: boolean) {}
    addFunc(funcName: string, callback: Function) {}
    callFunc(windowName: string, funcName: string, args: any[]): Promise<any> {}
}
