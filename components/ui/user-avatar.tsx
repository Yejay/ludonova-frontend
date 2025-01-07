import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';
import type { User } from '@/types/user';

const Avatar = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Root
		ref={ref}
		className={cn(
			'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
			className
		)}
		{...props}
	/>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn('aspect-square h-full w-full', className)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			'flex h-full w-full items-center justify-center rounded-full bg-muted',
			className
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

interface UserAvatarProps extends React.ComponentPropsWithoutRef<typeof Avatar> {
	user: User;
}

export function UserAvatar({ user, ...props }: UserAvatarProps) {
	return (
		<Avatar {...props}>
			<AvatarImage src={`https://avatar.vercel.sh/${user.username}`} alt={user.username} />
			<AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
		</Avatar>
	);
}

export { Avatar, AvatarImage, AvatarFallback }; 