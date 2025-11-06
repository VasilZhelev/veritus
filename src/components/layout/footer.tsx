'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { WordmarkIcon } from './header';

export function Footer() {
	const currentYear = new Date().getFullYear();

	const navigationLinks = [
		{
			label: 'Your Listings',
			href: '#',
		},
		{
			label: 'Compare',
			href: '#',
		},
		{
			label: 'About us',
			href: '#',
		},
	];

	const legalLinks = [
		{
			label: 'Privacy Policy',
			href: '#',
		},
		{
			label: 'Terms of Service',
			href: '#',
		},
		{
			label: 'Cookie Policy',
			href: '#',
		},
	];

	return (
		<footer className="border-t border-border bg-background">
			<div className="mx-auto w-full max-w-5xl px-4 py-12 md:px-2">
				<div className="grid gap-8 md:grid-cols-4">
					{/* Brand Section */}
					<div className="space-y-4 md:col-span-2">
						<Link href="/" className="inline-block">
							<WordmarkIcon className="h-5" />
						</Link>
						<p className="text-sm text-muted-foreground max-w-md">
							Build faster with Veritus. Modern components and utilities powered by shadcn/ui and Next.js.
						</p>
					</div>

					{/* Navigation Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Navigation</h3>
						<ul className="space-y-2">
							{navigationLinks.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className={cn(
											buttonVariants({ variant: 'ghost' }),
											'justify-start h-auto py-1 text-sm text-muted-foreground hover:text-foreground'
										)}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Legal Links */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Legal</h3>
						<ul className="space-y-2">
							{legalLinks.map((link) => (
								<li key={link.label}>
									<Link
										href={link.href}
										className={cn(
											buttonVariants({ variant: 'ghost' }),
											'justify-start h-auto py-1 text-sm text-muted-foreground hover:text-foreground'
										)}
									>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
					<p className="text-sm text-muted-foreground">
						© {currentYear} Veritus. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						<Link
							href="/login"
							className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
						>
							Sign In
						</Link>
						<Link
							href="/signup"
							className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
						>
							Sign Up
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

