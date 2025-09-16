"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { format } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const formSchema = z.object({
	url: z.string().url(),
	jobTitle: z.string().min(1),
	jobDescription: z.string().min(1),
	companyName: z.string().min(1),
	recruiterName: z.string().min(1),
	salaryStart: z.coerce.number().nonnegative().optional().nullable(),
	salaryEnd: z.coerce.number().nonnegative().optional().nullable(),
	// allow ISO strings from client, coerce to Date
	openDate: z.coerce.date().optional(),
	closeDate: z.coerce.date().optional(),
});

function JobAdForm() {
	const [submitting, setSubmitting] = useState(false);

	// 1. Define  form.
	// useForm setup
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			url: "",
			jobTitle: "",
			jobDescription: "",
			companyName: "",
			recruiterName: "",
			salaryStart: null,
			salaryEnd: null,
			openDate: undefined,
			closeDate: undefined,
		},
	});

	// 2. Define a submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.

		try {
			const res = await fetch("http://localhost:4000/api/jobs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(values),
			});
			if (!res.ok) throw new Error("Failed to submit");
			alert("🎉 Job saved!");
			setSubmitting(true);
			form.reset();
		} catch (err: unknown) {
			alert(err ?? "Submit failed");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="h-full flex flex-col justify-center">
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4 border p-6"
				>
					<FormField
						control={form.control}
						name="url"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Job URL</FormLabel>
								<FormControl>
									<Input
										placeholder="https://…"
										{...field}
										autoComplete="off"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="jobTitle"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Job title</FormLabel>
								<FormControl>
									<Input
										placeholder="Software Engineer"
										{...field}
										autoComplete="off"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="jobDescription"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Textarea
										rows={4}
										placeholder="Role details…"
										{...field}
										autoComplete="off"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="companyName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Company</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="off" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="recruiterName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Recruiter</FormLabel>
									<FormControl>
										<Input {...field} autoComplete="off" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="salaryStart"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Salary (from)</FormLabel>
									<FormControl>
										<Input
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											autoComplete="off"
											value={field.value ?? ""}
											onChange={(e) => {
												const raw = e.target.value;

												// allow empty string
												if (raw === "") {
													field.onChange(null);
													return;
												}

												// strip non-digits
												const digitsOnly = raw.replace(/\D/g, "");
												// update input box (still string)
												e.target.value = digitsOnly;

												// pass number to form
												field.onChange(digitsOnly ? Number(digitsOnly) : null);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="salaryEnd"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Salary (to)</FormLabel>
									<FormControl>
										<Input
											type="text"
											inputMode="numeric"
											pattern="[0-9]*"
											autoComplete="off"
											value={field.value ?? ""}
											onChange={(e) => {
												const raw = e.target.value;

												// allow empty string
												if (raw === "") {
													field.onChange(null);
													return;
												}

												// strip non-digits
												const digitsOnly = raw.replace(/\D/g, "");
												// update input box (still string)
												e.target.value = digitsOnly;

												// pass number to form
												field.onChange(digitsOnly ? Number(digitsOnly) : null);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={form.control}
							name="openDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Open date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={`w-full justify-start text-left font-normal ${
														!field.value && "text-muted-foreground"
													}`}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value
														? field.value.toLocaleDateString("en-AU")
														: "Pick a date"}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="closeDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Open date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={`w-full justify-start text-left font-normal ${
														!field.value && "text-muted-foreground"
													}`}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{field.value
														? field.value.toLocaleDateString("en-AU")
														: "Pick a date"}
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={field.onChange}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<Button
						type="submit"
						disabled={submitting}
						className="mt-8 hover:cursor-pointer"
					>
						{submitting ? "Saving…" : "Save"}
					</Button>
				</form>
			</Form>
		</div>
	);
}

export default JobAdForm;
