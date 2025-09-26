'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from '@/src/components/ui/dialog';
import {
   Form,
   FormControl,
   FormDescription,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '@/src/state/store/workspace-store';
import { CreateWorkspaceRequest } from '@/src/types/workspace';

const createWorkspaceSchema = z.object({
   name: z
      .string()
      .min(1, 'Workspace name is required')
      .max(50, 'Name must be less than 50 characters'),
   description: z.string().max(200, 'Description must be less than 200 characters').optional(),
   isPublic: z.boolean().default(false),
   allowInvites: z.boolean().default(true),
   notifications: z.boolean().default(true),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceDialogProps {
   children?: React.ReactNode;
   onSuccess?: (workspaceId: string) => void;
}

export function CreateWorkspaceDialog({ children, onSuccess }: CreateWorkspaceDialogProps) {
   const [open, setOpen] = React.useState(false);
   const { createWorkspace, isLoading } = useWorkspaceStore();

   const form = useForm<CreateWorkspaceFormData>({
      resolver: zodResolver(createWorkspaceSchema),
      defaultValues: {
         name: '',
         description: '',
         isPublic: false,
         allowInvites: true,
         notifications: true,
      },
   });

   const onSubmit = async (data: CreateWorkspaceFormData) => {
      try {
         const request: CreateWorkspaceRequest = {
            name: data.name,
            description: data.description || undefined,
            settings: {
               privacy: {
                  isPublic: data.isPublic,
                  allowInvites: data.allowInvites,
               },
               notifications: {
                  enabled: data.notifications,
                  email: data.notifications,
                  push: false,
               },
            },
         };

         const newWorkspace = await createWorkspace(request);

         // Reset form and close dialog
         form.reset();
         setOpen(false);

         // Call success callback
         onSuccess?.(newWorkspace.id);
      } catch (error) {
         console.error('Failed to create workspace:', error);
         // Error handling is done in the store
      }
   };

   const handleOpenChange = (newOpen: boolean) => {
      if (!isLoading) {
         setOpen(newOpen);
         if (!newOpen) {
            form.reset();
         }
      }
   };

   return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
         <DialogTrigger asChild>
            {children || (
               <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
               </Button>
            )}
         </DialogTrigger>

         <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
               <DialogTitle>Create New Workspace</DialogTitle>
               <DialogDescription>
                  Create a new workspace to organize your projects and collaborate with your team.
               </DialogDescription>
            </DialogHeader>

            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Workspace Name</FormLabel>
                              <FormControl>
                                 <Input
                                    placeholder="Enter workspace name"
                                    {...field}
                                    disabled={isLoading}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                           <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                 <Textarea
                                    placeholder="Describe what this workspace is for"
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                    disabled={isLoading}
                                 />
                              </FormControl>
                              <FormDescription>
                                 Help your team understand the purpose of this workspace.
                              </FormDescription>
                              <FormMessage />
                           </FormItem>
                        )}
                     />

                     <div className="space-y-4">
                        <FormField
                           control={form.control}
                           name="isPublic"
                           render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                 <div className="space-y-0.5">
                                    <FormLabel className="text-base">Public Workspace</FormLabel>
                                    <FormDescription>
                                       Allow anyone with the link to view this workspace
                                    </FormDescription>
                                 </div>
                                 <FormControl>
                                    <Switch
                                       checked={field.value}
                                       onCheckedChange={field.onChange}
                                       disabled={isLoading}
                                    />
                                 </FormControl>
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name="allowInvites"
                           render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                 <div className="space-y-0.5">
                                    <FormLabel className="text-base">Allow Invites</FormLabel>
                                    <FormDescription>
                                       Let members invite others to this workspace
                                    </FormDescription>
                                 </div>
                                 <FormControl>
                                    <Switch
                                       checked={field.value}
                                       onCheckedChange={field.onChange}
                                       disabled={isLoading}
                                    />
                                 </FormControl>
                              </FormItem>
                           )}
                        />

                        <FormField
                           control={form.control}
                           name="notifications"
                           render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                 <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                       Enable Notifications
                                    </FormLabel>
                                    <FormDescription>
                                       Receive notifications for workspace activity
                                    </FormDescription>
                                 </div>
                                 <FormControl>
                                    <Switch
                                       checked={field.value}
                                       onCheckedChange={field.onChange}
                                       disabled={isLoading}
                                    />
                                 </FormControl>
                              </FormItem>
                           )}
                        />
                     </div>
                  </div>

                  <DialogFooter>
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Workspace
                     </Button>
                  </DialogFooter>
               </form>
            </Form>
         </DialogContent>
      </Dialog>
   );
}
