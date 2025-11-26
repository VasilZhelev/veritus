'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/icons/menu-toggle-icon';
import { useScroll } from '@/hooks/use-scroll';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { UserMenu } from '@/components/user-menu';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);
	const { user, loading, signOut } = useAuth();
	const { t } = useLanguage();

	const links = [
		{
			label: t('nav.yourListings'),
			href: '/listings',
		},
		{
			label: t('nav.compare'),
			href: '/compare',
		},
		{
			label: t('nav.vinCheck'),
			href: '/vin-check',
		},
		{
			label: t('nav.aboutUs'),
			href: '/about',
		},
	];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out',
					{
						'md:px-2': scrolled,
					},
				)}
			>
				<Link href="/">
					<WordmarkIcon className="h-16" />
				</Link>
				<div className="hidden items-center gap-2 md:flex">
					{links.map((link, i) => (
						<Link key={i} className={buttonVariants({ variant: 'ghost' })} href={link.href}>
							{link.label}
						</Link>
					))}
					{loading ? (
						<div className="h-10 w-20 animate-pulse rounded-md bg-muted" />
					) : user ? (
						<UserMenu />
					) : (
						<>
							<Link href="/login">
								<Button variant="outline">{t('nav.signIn')}</Button>
							</Link>
							<Link href="/signup">
								<Button>{t('nav.getStarted')}</Button>
							</Link>
						</>
					)}
				</div>
				<Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden">
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>

			<div
				className={cn(
					'bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
						'flex h-full w-full flex-col justify-between gap-y-2 p-4',
					)}
				>
					<div className="grid gap-y-2">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className={buttonVariants({
									variant: 'ghost',
									className: 'justify-start',
								})}
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-2">
						{loading ? (
							<div className="h-10 w-full animate-pulse rounded-md bg-muted" />
						) : user ? (
							<>
								<Link href="/settings" className="w-full">
									<Button variant="ghost" className="w-full justify-start">
										{t('nav.settings')}
									</Button>
								</Link>
								<Button variant="outline" className="w-full" onClick={() => signOut()}>
									{t('nav.signOut')}
								</Button>
							</>
						) : (
							<>
								<Link href="/login" className="w-full">
									<Button variant="outline" className="w-full">
										{t('nav.signIn')}
									</Button>
								</Link>
								<Link href="/signup" className="w-full">
									<Button className="w-full">{t('nav.getStarted')}</Button>
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}

export const WordmarkIcon = (props: React.ComponentProps<"svg">) => (
	<img 
		src="/veritu_logo.png" 
		alt="Veritus Logo" 
		className={props.className}
		style={{ width: 'auto' }}
	/>
);
