import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Edit, Eye, PlusCircle, Search, Trash2 } from "lucide-react";

function PackagePage() {
  // Sample data for packages
  const packages = [
    {
      id: "PKG-001",
      name: "Bali Adventure",
      duration: "7 days",
      price: "$1,299",
      bookings: 128,
      status: "Active",
    },
    {
      id: "PKG-002",
      name: "Paris Getaway",
      duration: "5 days",
      price: "$1,899",
      bookings: 89,
      status: "Active",
    },
    {
      id: "PKG-003",
      name: "Tokyo Explorer",
      duration: "10 days",
      price: "$2,499",
      bookings: 67,
      status: "Active",
    },
    {
      id: "PKG-004",
      name: "Egypt Wonders",
      duration: "9 days",
      price: "$1,799",
      bookings: 54,
      status: "Draft",
    },
  ];
  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Travel Packages</h2>
          <p className="text-gray-500">Manage your travel package offerings</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search packages..." className="pl-10 w-64" />
          </div>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <PlusCircle className="h-4 w-4 mr-2 " />
            Add Package
          </button>
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-3 pt-4 pl-6">Package ID</th>
                  <th className="pb-3 pt-4">Package Name</th>
                  <th className="pb-3 pt-4">Duration</th>
                  <th className="pb-3 pt-4">Price</th>
                  <th className="pb-3 pt-4">Total Bookings</th>
                  <th className="pb-3 pt-4">Status</th>
                  <th className="pb-3 pt-4 text-right pr-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 text-sm hover:bg-gray-50"
                  >
                    <td className="py-4 pl-6 font-medium">{pkg.id}</td>
                    <td className="py-4 font-medium">{pkg.name}</td>
                    <td className="py-4">{pkg.duration}</td>
                    <td className="py-4">{pkg.price}</td>
                    <td className="py-4">{pkg.bookings}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          pkg.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {pkg.status}
                      </span>
                    </td>
                    <td className="py-4 text-right pr-6">
                      <div className="flex justify-end space-x-2">
                        <button className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 p-0">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PackagePage;
