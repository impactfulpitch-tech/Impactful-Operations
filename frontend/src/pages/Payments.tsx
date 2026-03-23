import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAutoRefreshAnalytics } from "@/hooks/useAutoRefreshAnalytics";
import { usePaymentReminders } from "@/hooks/usePaymentReminders";
import { projectList } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, DollarSign, CheckCircle2, Clock, XCircle, Plus, Edit2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Form } from "@/components/Form";
import { logActivity } from "@/hooks/useActivityLog";

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  draft: { bg: "bg-slate-50", text: "text-slate-700", icon: Clock },
  sent: { bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  paid: { bg: "bg-green-50", text: "text-green-700", icon: CheckCircle2 },
  overdue: { bg: "bg-red-50", text: "text-red-700", icon: AlertCircle },
  cancelled: { bg: "bg-gray-50", text: "text-gray-700", icon: XCircle },
};

export default function Payments() {
  const { user } = useAuth();
  const { reminders } = usePaymentReminders();
  const isAdmin = user?.type === "admin";
  
  // Auto-refresh invoices data every second
  const { invoices: allAutoInvoices } = useAutoRefreshAnalytics();
  
  const [allInvoices, setAllInvoices] = useState(allAutoInvoices);
  
  useEffect(() => {
    setAllInvoices(allAutoInvoices);
  }, [allAutoInvoices]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  // Only show this page to admins
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Payment information is only available to administrators.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const filtered = allInvoices.filter((invoice) => {
    if (filterStatus !== "all" && invoice.status !== filterStatus) return false;
    if (filterProject !== "all" && invoice.projectId !== filterProject) return false;
    return true;
  });

  const stats = {
    totalAmount: filtered.reduce((sum, inv) => {
      if (inv.status !== "paid") return sum + inv.amount;
      return sum;
    }, 0),
    paidAmount: filtered
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0),
    overdue: filtered.filter((inv) => inv.status === "overdue").length,
    pending: filtered.filter((inv) => ["sent", "draft"].includes(inv.status)).length,
  };

  const handleAddInvoice = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = (data: Record<string, any>) => {
    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: data.invoiceNumber,
      projectId: data.projectId,
      milestoneId: data.milestoneId || "",
      amount: parseInt(data.amount) || 0,
      currency: data.currency || "INR",
      description: data.description,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
      clientName: data.clientName,
      notes: data.notes,
    };

    setAllInvoices([...allInvoices, newInvoice]);
    localStorage.setItem("allInvoices", JSON.stringify([...allInvoices, newInvoice]));
    
    logActivity({
      type: "add",
      entity: "invoice",
      title: newInvoice.invoiceNumber,
      description: `New invoice created - Amount: ₹${newInvoice.amount.toLocaleString()} - Client: ${newInvoice.clientName}`,
      user: "HR Admin",
    });
    setShowAddModal(false);
  };

  const handleEditInvoice = (invoice: typeof allInvoices[0]) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    if (selectedInvoice) {
      setAllInvoices(
        allInvoices.map((inv) =>
          inv.id === selectedInvoice.id
            ? {
                ...inv,
                invoiceNumber: data.invoiceNumber,
                amount: parseInt(data.amount),
                status: data.status,
                dueDate: data.dueDate,
                notes: data.notes,
                paidDate: data.status === "paid" ? data.paidDate : undefined,
              }
            : inv
        )
      );

      logActivity({
        type: "edit",
        entity: "invoice",
        title: data.invoiceNumber,
        description: `Invoice updated - Status: ${data.status}`,
        user: "HR Admin",
      });
      setShowEditModal(false);
    }
  };

  const projects = projectList.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-amber-500" />
            Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage invoices and payment reminders (Admin Only)
          </p>
        </div>
        <Button onClick={handleAddInvoice} className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* Payment Reminders Alert */}
      {reminders.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 rounded">
          <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
            💳 {reminders.length} Payment Reminder{reminders.length !== 1 ? "s" : ""}
          </h3>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="text-sm text-amber-800 dark:text-amber-300">
                <strong>{reminder.invoiceNumber}</strong> from {reminder.clientName} - ₹
                {reminder.amount.toLocaleString()} due {reminder.daysUntilDue === 15 ? "in 15 days" : `${Math.abs(reminder.daysUntilDue)} days overdue`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">Outstanding Amount</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            ₹{stats.totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-300 font-medium">Total Paid</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            ₹{stats.paidAmount.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-300 font-medium">Overdue</div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
            {stats.overdue} Invoice{stats.overdue !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-sm text-amber-600 dark:text-amber-300 font-medium">Pending</div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
            {stats.pending} Invoice{stats.pending !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
            Filter by Project
          </label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Projects</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Invoice Number
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Client
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((invoice) => {
              const StatusIcon = statusColors[invoice.status]?.icon || Clock;
              return (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {invoice.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                    ₹{invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={`${statusColors[invoice.status]?.bg} flex items-center gap-1 w-fit`}>
                      <StatusIcon className="w-3 h-3" />
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditInvoice(invoice)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No invoices found matching the selected filters.</p>
          </div>
        )}
      </div>

      {/* Add Invoice Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create New Invoice"
      >
        <Form
          fields={[
            { name: "invoiceNumber", label: "Invoice Number", type: "text", placeholder: "INV-2026-0001", required: true },
            { name: "clientName", label: "Client Name", type: "text", required: true },
            { 
              name: "projectId", 
              label: "Project", 
              type: "select", 
              options: projects.map(p => ({ value: p.id, label: p.name })), 
              required: true 
            },
            { name: "amounttext", label: "Amount (INR)", type: "text", placeholder: "45000", required: true },
            { name: "description", label: "Description", type: "textarea", placeholder: "Invoice description" },
            { name: "issueDate", label: "Issue Date", type: "date", required: true },
            { name: "dueDate", label: "Due Date", type: "date", required: true },
            { 
              name: "status", 
              label: "Status", 
              type: "select", 
              options: [
                { value: "draft", label: "Draft" }, 
                { value: "sent", label: "Sent" }, 
                { value: "paid", label: "Paid" }
              ], 
              required: true 
            },
            { name: "notes", label: "Notes", type: "textarea" },
          ]}
          onSubmit={(data) => {
            handleAddSubmit({
              ...data,
              amount: parseInt(data.amounttext),
            });
          }}
          submitLabel="Add Invoice"
        />
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Invoice"
      >
        {selectedInvoice && (
          <Form
            initialData={{
              invoiceNumber: selectedInvoice.invoiceNumber,
              amounttext: selectedInvoice.amount.toString(),
              dueDate: selectedInvoice.dueDate,
              status: selectedInvoice.status,
              paidDate: selectedInvoice.paidDate || "",
              notes: selectedInvoice.notes || "",
            }}
            fields={[
              { name: "invoiceNumber", label: "Invoice Number", type: "text", required: true },
              { name: "amounttext", label: "Amount (INR)", type: "text", required: true },
              { name: "dueDate", label: "Due Date", type: "date", required: true },
              { 
                name: "status", 
                label: "Status", 
                type: "select", 
                options: [
                  { value: "draft", label: "Draft" }, 
                  { value: "sent", label: "Sent" }, 
                  { value: "paid", label: "Paid" }, 
                  { value: "overdue", label: "Overdue" }
                ], 
                required: true 
              },
              { name: "paidDate", label: "Paid Date", type: "date" },
              { name: "notes", label: "Notes", type: "textarea" },
            ]}
            onSubmit={(data) => {
              handleEditSubmit({
                ...data,
                amount: parseInt(data.amounttext),
              });
            }}
            submitLabel="Update Invoice"
          />
        )}
      </Modal>
    </div>
  );
}
