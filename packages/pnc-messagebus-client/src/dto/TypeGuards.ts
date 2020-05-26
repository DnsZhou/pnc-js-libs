import BuildChangedNotification from "./BuildChangedNotification";
import GenericSettingAnnouncementNotification from "./GenericSettingAnnouncementNotification";
import GenericSettingMaintenanceNotification from "./GenericSettingMaintenanceNotification";
import GroupBuildStatusChangedNotification from "./GroupBuildStatusChangedNotification";
import ScmRepositoryCreationNotification from "./ScmRepositoryCreationNotification";
import Notification from "./Notification";


export function isBuildChangedNotification(notification: Notification): notification is BuildChangedNotification {
    return notification.job === "BUILD";
}

export function isGroupBuildStatusChangedNotification(notification: Notification): notification is GroupBuildStatusChangedNotification {
    return notification.job === "GROUP_BUILD";
}

export function isGenericSettingMaintenanceNotification(notification: Notification): notification is GenericSettingMaintenanceNotification {
    return notification.job === "GENERIC_SETTING" && notification.notificationType === "MAINTENANCE_STATUS_CHANGED";
}

export function isGenericSettingAnnouncementNotification(notification: Notification): notification is GenericSettingAnnouncementNotification {
    return notification.job === "GENERIC_SETTING" && notification.notificationType === "NEW_ANNOUNCEMENT";
}


export function isScmRepositoryCreationSuccessNotification(notification: Notification): notification is ScmRepositoryCreationNotification {
    return notification.job === "SCM_REPOSITORY_CREATION" && notification.notificationType === "SCMR_CREATION_SUCCESS";
}
