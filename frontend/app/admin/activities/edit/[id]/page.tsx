"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { adminService } from "@/lib/api/services/admin";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminForm } from "@/components/ui/admin-form";
import { Loader2 } from "lucide-react";

export default function EditActivityPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!activityId) return;
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await adminService.getActivityDetails(activityId);
        const d: any = data;
        setFormData({
          name: d.name || "",
          activity_type: d.activity_type?.toString() || "outdoor",
          description: d.description || "",
          duration_hours: d.duration_hours !== undefined && d.duration_hours !== null ? d.duration_hours.toString() : "",
          difficulty_level: d.difficulty_level?.toString() || "easy",
          age_restriction: d.age_restriction || "",
          is_active: typeof d.is_active === 'boolean' ? d.is_active : true,
          featured_image: d.featured_image || undefined,
        });
      } catch (error: any) {
        toast.error("Failed to load activity", { description: error.message || "Please try again" });
        router.push("/admin/activities");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId]);

  const formFields = [
    { name: "name", label: "Activity Name", type: "text" as const, required: true, placeholder: "Enter activity name" },
    { name: "activity_type", label: "Activity Type", type: "select" as const, required: true, options: [
      { value: "outdoor", label: "Outdoor" },
      { value: "indoor", label: "Indoor" },
      { value: "water", label: "Water Sports" },
      { value: "adventure", label: "Adventure" },
      { value: "cultural", label: "Cultural" },
      { value: "nature", label: "Nature" },
      { value: "sports", label: "Sports" },
      { value: "wellness", label: "Wellness" },
    ] },
    { name: "description", label: "Description", type: "textarea" as const, required: true, placeholder: "Describe the activity...", rows: 4 },
    { name: "duration_hours", label: "Duration (Hours)", type: "number" as const, required: true, placeholder: "e.g., 2", min: 1, step: 1 },
    { name: "difficulty_level", label: "Difficulty Level", type: "select" as const, required: true, options: [
      { value: "easy", label: "Easy" },
      { value: "moderate", label: "Moderate" },
      { value: "challenging", label: "Challenging" },
      { value: "extreme", label: "Extreme" },
    ] },
    { name: "age_restriction", label: "Age Restriction", type: "text" as const, placeholder: "e.g., 18+, 12-65, No restriction" },
    { name: "featured_image", label: "Featured Image", type: "file" as const, accept: "image/*", maxSize: 5 },
    { name: "is_active", label: "Active", type: "checkbox" as const },
  ];

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuredImageFile = formData.featured_image instanceof File ? formData.featured_image : undefined;
      const updateData = {
        name: formData.name,
        activity_type: formData.activity_type,
        description: formData.description,
        duration_hours: formData.duration_hours ? parseInt(formData.duration_hours) : undefined,
        difficulty_level: formData.difficulty_level,
        age_restriction: formData.age_restriction,
        is_active: formData.is_active,
      };
      await adminService.updateActivity(activityId, updateData, featuredImageFile);
      toast.success("Activity updated successfully!");
      router.push(`/admin/activities/${activityId}`);
    } catch (error: any) {
      toast.error("Failed to update activity", { description: error.message || "Please try again" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading activity...</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminForm
            title=""
            fields={formFields}
            data={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitText="Update Activity"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
