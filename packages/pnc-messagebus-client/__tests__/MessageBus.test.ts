import { WS } from "jest-websocket-mock";
import MessageBus from "../src/MessageBus";


describe("MessageBus", () => {
    const WS_URL: string = "ws://localhost:7890/";
    let server: WS;
    let messageBus: MessageBus;
    let clientSocket: WebSocket;

    let mockBuildInProgressNotification: any;

    let mockListener: any;

    beforeEach(async () => {
        mockBuildInProgressNotification = await import("./data/build-in-progress-notification.json");
        mockListener = jest.fn();

        server = new WS(WS_URL, { jsonProtocol: true });

        messageBus = new MessageBus(WS_URL);
        await messageBus.connect();

        clientSocket = await server.connected;
    });

    afterEach(async () => {
        await messageBus.close();
        WS.clean();
    });

    it("should connect to the given websocket URL when connect method is called", async () => {
        expect(clientSocket.readyState).toEqual(clientSocket.OPEN);
        expect(clientSocket.url).toEqual(WS_URL);
    });

    it("should disconnect from the server when the close method is called", async () => {
        const closeEvent = await messageBus.close();

        await server.closed;

        expect(clientSocket.readyState).toEqual(clientSocket.CLOSED);

        expect(closeEvent.wasClean).toBeTruthy();
        expect(closeEvent.code).toEqual(1000);
        expect(closeEvent.reason).toEqual("Client session finished");
    });

    it("should notify onBuildProgressChange listeners when it receives a BUILD job notification", async () => {
        messageBus.onBuildProgressChange(mockListener);

        server.send(mockBuildInProgressNotification);

        expect(mockListener.mock.calls.length).toEqual(1);
        expect(mockListener.mock.calls[0][0]).toEqual(mockBuildInProgressNotification.build);
        expect(mockListener.mock.calls[0][1]).toEqual(mockBuildInProgressNotification);
    });

    it("should NOT notify a listener once it has been unsubscribed", async () => {
        const unsubscribe = messageBus.onBuildProgressChange(mockListener);

        expect(unsubscribe).toBeDefined();

        unsubscribe();

        server.send(mockBuildInProgressNotification);

        expect(mockListener.mock.calls.length).toEqual(0);
    });

    it("should notify onBuildStatusChange listeners when it receives a BUILD job notification", async () => {
        messageBus.onBuildStatusChange(mockListener);

        server.send(mockBuildInProgressNotification);

        expect(mockListener.mock.calls.length).toEqual(1);
        expect(mockListener.mock.calls[0][0]).toEqual(mockBuildInProgressNotification.build);
        expect(mockListener.mock.calls[0][1]).toEqual(mockBuildInProgressNotification);
    });

    it("should notify onBuildStatus listeners when it receives a notification with a matching build status", async () => {
        messageBus.onBuildStatus("BUILDING", mockListener);

        server.send(mockBuildInProgressNotification);

        expect(mockListener.mock.calls[0][0]).toEqual(mockBuildInProgressNotification.build);
        expect(mockListener.mock.calls[0][1]).toEqual(mockBuildInProgressNotification);
    });

    it("should NOT notify onBuildStatus listeners when it receives a notification with a non-matching build status", async () => {
        messageBus.onBuildStatus("FAILED", mockListener);

        server.send(mockBuildInProgressNotification);

        expect(mockListener.mock.calls.length).toEqual(0);
    });
});
