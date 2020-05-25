(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.PncJsLibs = {}));
}(this, (function (exports) { 'use strict';

    function isBuildChangedNotification(notification) {
        return notification.job === "BUILD";
    }
    function isGroupBuildStatusChangedNotification(notification) {
        return notification.job === "GROUP_BUILD";
    }
    function isGenericSettingMaintenanceNotification(notification) {
        return notification.job === "GENERIC_SETTING" && notification.notificationType === "MAINTENANCE_STATUS_CHANGED";
    }
    function isGenericSettingAnnouncementNotification(notification) {
        return notification.job === "GENERIC_SETTING" && notification.notificationType === "NEW_ANNOUNCEMENT";
    }

    class MessageBus {
        constructor(url) {
            this.dispatchers = [];
            this.url = url;
        }
        async connect() {
            return new Promise((resolve, reject) => {
                this.ws = new WebSocket(this.url);
                this.ws.addEventListener("open", () => resolve());
                this.ws.addEventListener("message", message => this.dispatch(message));
            });
        }
        async close() {
            return new Promise(resolve => {
                if (this.ws.readyState === this.ws.CLOSED) {
                    resolve();
                    return;
                }
                this.ws.addEventListener("close", event => resolve(event));
                this.ws.close(1000, "Client session finished");
            });
        }
        onMessage(listener) {
            const dispatcher = message => listener(message);
            return this.addDispatcher(dispatcher);
        }
        onBuildProgressChange(listener) {
            const dispatcher = notification => {
                if (isBuildChangedNotification(notification) && notification.progress !== notification.oldProgress) {
                    listener(notification.build, notification);
                }
            };
            return this.addDispatcher(dispatcher);
        }
        onBuildProgress(progress, listener) {
            return this.addDispatcher(notification => {
                if (isBuildChangedNotification(notification)
                    && notification.progress === progress
                    && notification.progress !== notification.oldProgress) {
                    listener(notification.build, notification);
                }
            });
        }
        onBuildStatusChange(listener) {
            return this.addDispatcher(notification => {
                if (isBuildChangedNotification(notification)) {
                    listener(notification.build, notification);
                }
            });
        }
        onBuildStatus(status, listener) {
            return this.addDispatcher(notification => {
                if (isBuildChangedNotification(notification) && notification.build.status === status) {
                    listener(notification.build, notification);
                }
            });
        }
        onGroupBuildProgressChange(listener) {
            return this.addDispatcher(notification => {
                if (isGroupBuildStatusChangedNotification(notification) && notification.progress !== notification.oldProgress) {
                    listener(notification.groupBuild, notification);
                }
            });
        }
        onGroupBuildProgress(progress, listener) {
            return this.addDispatcher(notification => {
                if (isGroupBuildStatusChangedNotification(notification)
                    && notification.progress === progress
                    && notification.progress !== notification.oldProgress) {
                    listener(notification.groupBuild, notification);
                }
            });
        }
        onGroupBuildStatusChange(listener) {
            return this.addDispatcher(notification => {
                if (isGroupBuildStatusChangedNotification(notification)) {
                    listener(notification.groupBuild, notification);
                }
            });
        }
        onGroupBuildStatus(status, listener) {
            return this.addDispatcher(notification => {
                if (isGroupBuildStatusChangedNotification(notification) && notification.groupBuild.status === status) {
                    listener(notification.groupBuild, notification);
                }
            });
        }
        onGenericSettingMaintenanceChanged(listener) {
            return this.addDispatcher(notification => {
                if (isGenericSettingMaintenanceNotification(notification)) {
                    listener(notification);
                }
            });
        }
        onGenericSettingNewAnnouncement(listener) {
            return this.addDispatcher(notification => {
                if (isGenericSettingAnnouncementNotification(notification)) {
                    listener(notification);
                }
            });
        }
        addDispatcher(dispatcher) {
            this.dispatchers.push(dispatcher);
            return () => this.removeDispatcher(dispatcher);
        }
        removeDispatcher(dispatcher) {
            const index = this.dispatchers.indexOf(dispatcher);
            if (index >= 0) {
                this.dispatchers.splice(index, 1);
            }
        }
        dispatch(message) {
            const notification = JSON.parse(message.data);
            this.dispatchers.forEach(dispatcher => dispatcher(notification));
        }
    }

    exports.MessageBus = MessageBus;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
