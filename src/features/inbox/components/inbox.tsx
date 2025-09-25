'use client';

import {
   ResizableHandle,
   ResizablePanel,
   ResizablePanelGroup,
} from '@/src/components/ui/resizable';
import { useNotificationsStore } from '@/src/state/store/notifications-store';
import IssueLine from './issue-line';
import NotificationPreview from './issue-preview';

export default function Inbox() {
   const { notifications, selectedNotification, setSelectedNotification, markAsRead } =
      useNotificationsStore();

   return (
      <ResizablePanelGroup
         direction="horizontal"
         autoSaveId="inbox-panel-group"
         className="w-full h-full"
      >
         <ResizablePanel defaultSize={350} maxSize={500} minSize={280} className="border-r">
            <div className="w-full flex flex-col overflow-y-auto h-full">
               {notifications.map((notification) => (
                  <IssueLine
                     key={notification.id}
                     notification={notification}
                     isSelected={selectedNotification?.id === notification.id}
                     onClick={() => setSelectedNotification(notification)}
                     showId
                     showStatusIcon
                  />
               ))}
            </div>
         </ResizablePanel>
         <ResizableHandle withHandle />
         <ResizablePanel defaultSize={350} maxSize={500} minSize={280}>
            <NotificationPreview notification={selectedNotification} onMarkAsRead={markAsRead} />
         </ResizablePanel>
      </ResizablePanelGroup>
   );
}
