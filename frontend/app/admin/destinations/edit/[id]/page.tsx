"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminService, AdminDestinationDetail } from "@/lib/api/services/admin";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminForm } from "@/components/ui/admin-form";
import { Loader2, ArrowLeft } from "lucide-react";

const formFields = [
	{ name: "name", label: "Destination Name", type: "text" as const, required: true, placeholder: "Enter destination name" },
	{ name: "country", label: "Country", type: "text" as const, required: true, placeholder: "Enter country name" },
	{ name: "city", label: "City", type: "text" as const, required: true, placeholder: "Enter city name" },
	{ name: "best_time_to_visit", label: "Best Time to Visit", type: "text" as const, required: false, placeholder: "e.g., October to March" },
	{ name: "timezone", label: "Timezone", type: "text" as const, required: true, placeholder: "e.g., UTC+5:30" },
	{ name: "description", label: "Description", type: "textarea" as const, required: true, placeholder: "Describe the destination...", rows: 4 },
	{ name: "featured_image", label: "Featured Image", type: "file" as const, accept: "image/*", maxSize: 5 },
	{ name: "is_active", label: "Active", type: "checkbox" as const }
];

interface EditDestinationPageProps {
	params: { id: string };
}

export default function EditDestinationPage({ params }: EditDestinationPageProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<Record<string, any>>({});
	const [destination, setDestination] = useState<AdminDestinationDetail | null>(null);
	const destinationId = params.id;

	useEffect(() => {
		fetchDestination();
		// eslint-disable-next-line
	}, [destinationId]);

	const fetchDestination = async () => {
		try {
			setLoading(true);
			const data = await adminService.getDestinationDetails(destinationId);
			setDestination(data);
			setFormData({
				name: data.name,
				country: data.country,
				city: data.city,
				best_time_to_visit: data.best_time_to_visit,
				timezone: data.timezone,
				description: data.description,
				is_active: data.is_active,
				featured_image: undefined
			});
		} catch (error: any) {
			toast.error("Failed to load destination", { description: error?.message || "Please try again" });
			router.push("/admin/destinations");
		} finally {
			setLoading(false);
		}
	};

	const handleFormChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		try {
			const featuredImageFile = formData.featured_image instanceof File ? formData.featured_image : undefined;
			const updateData = {
				name: formData.name,
				country: formData.country,
				city: formData.city,
				best_time_to_visit: formData.best_time_to_visit,
				timezone: formData.timezone,
				description: formData.description,
				is_active: formData.is_active
			};
			await adminService.updateDestination(destinationId, updateData, featuredImageFile);
			toast.success("Destination updated successfully");
			router.push(`/admin/destinations/${destinationId}`);
		} catch (error: any) {
			toast.error("Failed to update destination", { description: error?.message || "Please try again" });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
				<p className="mt-2 text-gray-600">Loading destination...</p>
			</div>
		);
	}

	return (
		<div className="max-w-2xl mx-auto py-10">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => router.push(`/admin/destinations/${destinationId}`)}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Details
						</Button>
						Edit Destination
					</CardTitle>
				</CardHeader>
				<CardContent>
					<AdminForm
						title=""
						fields={formFields}
						data={formData}
						onChange={handleFormChange}
						onSubmit={handleSubmit}
						submitText={saving ? "Saving..." : "Update Destination"}
						loading={saving}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
