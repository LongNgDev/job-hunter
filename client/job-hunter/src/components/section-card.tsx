import React from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";

function SectionCards() {
	return (
		<div className="w-full m-auto min-w-sm">
			<div className="grid grid-rows-4 gap-4 sm:grid-rows-2 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-1 ">
				<Card className="flex flex-col gap-10">
					<CardHeader>
						<CardDescription>Total Applications</CardDescription>
						<CardTitle className="text-4xl">20</CardTitle>
						<CardAction>
							<Badge variant="outline">
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter>
						<p>Card Footer</p>
					</CardFooter>
				</Card>

				{/* Application Submitted*/}
				<Card className="flex flex-col gap-10">
					<CardHeader>
						<CardDescription>Submitted</CardDescription>
						<CardTitle className="text-4xl">20</CardTitle>
						<CardAction>
							<Badge variant="outline">
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter>
						<p>Card Footer</p>
					</CardFooter>
				</Card>

				{/* In Progress */}
				<Card className="flex flex-col gap-10">
					<CardHeader>
						<CardDescription>In Progress</CardDescription>
						<CardTitle className="text-4xl">20</CardTitle>
						<CardAction>
							<Badge variant="outline">
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter>
						<p>Card Footer</p>
					</CardFooter>
				</Card>

				{/* Rejected */}
				<Card className="flex flex-col gap-10">
					<CardHeader>
						<CardDescription>Reject</CardDescription>
						<CardTitle className="text-4xl">20</CardTitle>
						<CardAction>
							<Badge variant="outline">
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter>
						<p>Card Footer</p>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}

export default SectionCards;
