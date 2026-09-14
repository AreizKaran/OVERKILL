import { useMemo, useState } from 'react';
import { Banknote, CreditCard, Download, Receipt, Search, Wallet } from 'lucide-react';
import { useApi } from '../../lib/useApi.js';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Badge, Button, Card, CardHeader, EmptyState, Field, Input, Progress, Select, SkeletonCard, Table, Td, Th } from '../../components/ui/index.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { SplitBar } from '../../components/charts/index.jsx';
import { formatDate, formatDateTime, inr, inrCompact, relativeTime } from '../../lib/format.js';

const STATUS_TONE = { paid: 'emerald', partial: 'amber', pending: 'brand', overdue: 'rose' };

export default function Fees() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentFees /> : <AdminFees />;
}

/* ---------------------------- Student ----------------------------- */
function StudentFees() {
  const toast = useToast();
  const { data, loading, reload } = useApi('/fees');
  const [paying, setPaying] = useState(null);

  if (loading) return <SkeletonCard lines={8} />;
  const fee = data?.[0];
  if (!fee) {
    return (
      <>
        <PageHeader eyebrow="Campus" title="Fees & Finance" />
        <EmptyState icon={Wallet} title="No fee demand raised" description="Your semester fee demand will appear here once the accounts section generates it." />
      </>
    );
  }

  const outstanding = Math.max(fee.totalAmount - fee.paidAmount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Fees & Finance"
        description={`Semester ${fee.semester} demand for the academic year ${fee.academicYear}.`}
        actions={outstanding > 0 ? <Button icon={CreditCard} onClick={() => setPaying(fee)}>Pay now</Button> : null}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total demand" value={inr(fee.totalAmount)} sub={`Semester ${fee.semester}`} icon={Receipt} tone="brand" />
        <StatCard index={1} label="Amount paid" value={inr(fee.paidAmount)} sub={`${fee.transactions.length} transaction(s)`} icon={Banknote} tone="emerald" />
        <StatCard
          index={2}
          label="Outstanding"
          value={outstanding > 0 ? inr(outstanding) : 'Cleared'}
          sub={outstanding > 0 ? `Due ${formatDate(fee.dueDate)} · ${relativeTime(fee.dueDate)}` : 'Nothing pending'}
          icon={Wallet}
          tone={outstanding > 0 ? (fee.status === 'overdue' ? 'rose' : 'amber') : 'emerald'}
        />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Fee break-up" subtitle={`Status: ${fee.status}`} icon={Receipt} action={<Badge tone={STATUS_TONE[fee.status]} className="capitalize">{fee.status}</Badge>} />
          <Table>
            <thead>
              <tr>
                <Th>Head</Th>
                <Th align="right">Amount</Th>
              </tr>
            </thead>
            <tbody>
              {fee.items.map((item) => (
                <tr key={item.head}>
                  <Td>{item.head}</Td>
                  <Td align="right" className="font-medium tabular-nums">{inr(item.amount)}</Td>
                </tr>
              ))}
              <tr>
                <Td className="font-semibold">Total</Td>
                <Td align="right" className="font-display font-bold tabular-nums">{inr(fee.totalAmount)}</Td>
              </tr>
            </tbody>
          </Table>

          <div className="mt-5">
            <SplitBar
              total={fee.totalAmount}
              segments={[
                { label: 'Paid', value: fee.paidAmount },
                { label: 'Outstanding', value: outstanding },
              ]}
              formatValue={inr}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Transaction history" icon={Banknote} />
          {fee.transactions.length ? (
            <ul className="space-y-3">
              {fee.transactions.map((transaction) => (
                <li key={transaction.transactionId} className="surface-muted p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display text-base font-bold">{inr(transaction.amount)}</span>
                    <Badge tone="emerald">{transaction.mode}</Badge>
                  </div>
                  <dl className="mt-2 space-y-1 text-xs text-ink-500 dark:text-ink-400">
                    <div className="flex justify-between gap-2"><dt>Receipt</dt><dd className="font-medium tabular-nums">{transaction.receiptNo}</dd></div>
                    <div className="flex justify-between gap-2"><dt>Transaction</dt><dd className="font-medium tabular-nums">{transaction.transactionId}</dd></div>
                    <div className="flex justify-between gap-2"><dt>Paid on</dt><dd className="font-medium">{formatDateTime(transaction.paidAt)}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Banknote} title="No payments recorded" description="Payments you make appear here with an instant receipt." />
          )}
        </Card>
      </div>

      <PaymentModal
        fee={paying}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null);
          reload();
          toast('Payment recorded. Your receipt is available in the transaction history.');
        }}
      />
    </>
  );
}

/* ----------------------------- Admin ------------------------------ */
function AdminFees() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const path = useMemo(() => (status ? `/fees?status=${status}` : '/fees'), [status]);
  const { data, meta, loading, reload } = useApi(path);
  const [paying, setPaying] = useState(null);

  const visible = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (fee) => fee.student?.user?.name?.toLowerCase().includes(q) || fee.student?.registrationNo?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const exportCsv = () => {
    const rows = [
      ['Registration No', 'Student', 'Semester', 'Billed', 'Paid', 'Outstanding', 'Status', 'Due date'],
      ...visible.map((fee) => [
        fee.student?.registrationNo, fee.student?.user?.name, fee.semester,
        fee.totalAmount, fee.paidAmount, fee.totalAmount - fee.paidAmount, fee.status, formatDate(fee.dueDate),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `smit-fee-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${visible.length} fee records.`);
  };

  return (
    <>
      <PageHeader
        eyebrow="Campus"
        title="Fees & Finance"
        description="Semester demand, collection progress and outstanding dues across the institute."
        actions={<Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!visible.length}>Export CSV</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label="Total billed" value={inrCompact(meta?.billed ?? 0)} sub={`${meta?.count ?? 0} demand notes`} icon={Receipt} tone="brand" />
        <StatCard index={1} label="Collected" value={inrCompact(meta?.collected ?? 0)} sub={meta?.billed ? `${((meta.collected / meta.billed) * 100).toFixed(1)}% of demand` : '—'} icon={Banknote} tone="emerald" />
        <StatCard index={2} label="Outstanding" value={inrCompact(meta?.outstanding ?? 0)} sub="Across all students" icon={Wallet} tone="amber" />
      </div>

      <Card className="mt-6 p-4 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by student name or registration number…" className="pl-9" aria-label="Search fee records" />
          </div>
          <Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by payment status">
            <option value="">All statuses</option>
            {['paid', 'partial', 'pending', 'overdue'].map((value) => (
              <option key={value} value={value} className="capitalize">{value}</option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="mt-5">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : visible.length ? (
          <Table>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th align="center">Semester</Th>
                <Th align="right">Billed</Th>
                <Th align="right">Paid</Th>
                <Th align="right">Outstanding</Th>
                <Th align="center">Status</Th>
                <Th align="right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {visible.map((fee) => {
                const outstanding = Math.max(fee.totalAmount - fee.paidAmount, 0);
                return (
                  <tr key={fee._id} className="transition hover:bg-ink-50 dark:hover:bg-white/[0.03]">
                    <Td>
                      <span className="text-[0.875rem] font-medium">{fee.student?.user?.name}</span>
                      <span className="block text-xs text-ink-500 dark:text-ink-400">{fee.student?.registrationNo}</span>
                    </Td>
                    <Td align="center" className="tabular-nums">{fee.semester}</Td>
                    <Td align="right" className="tabular-nums">{inr(fee.totalAmount)}</Td>
                    <Td align="right" className="tabular-nums">{inr(fee.paidAmount)}</Td>
                    <Td align="right" className="font-medium tabular-nums">{outstanding ? inr(outstanding) : '—'}</Td>
                    <Td align="center"><Badge tone={STATUS_TONE[fee.status]} className="capitalize">{fee.status}</Badge></Td>
                    <Td align="right">
                      {outstanding > 0 ? (
                        <Button size="sm" variant="secondary" onClick={() => setPaying(fee)}>Record payment</Button>
                      ) : (
                        <span className="text-xs text-ink-400">Cleared</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon={Wallet} title="No fee records found" description="Adjust the filters to widen the results." />
        )}
      </Card>

      <PaymentModal
        fee={paying}
        onClose={() => setPaying(null)}
        onPaid={() => {
          setPaying(null);
          reload();
          toast('Payment recorded and a receipt generated.');
        }}
      />
    </>
  );
}

function PaymentModal({ fee, onClose, onPaid }) {
  const toast = useToast();
  const outstanding = fee ? Math.max(fee.totalAmount - fee.paidAmount, 0) : 0;
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Net Banking');
  const [saving, setSaving] = useState(false);

  const pay = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/fees/${fee._id}/payments`, { amount: Number(amount || outstanding), mode });
      setAmount('');
      onPaid();
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={Boolean(fee)}
      onClose={onClose}
      title="Record a payment"
      description={fee ? `Semester ${fee.semester} · outstanding ${inr(outstanding)}` : ''}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button form="payment-form" type="submit" loading={saving} icon={CreditCard}>Confirm payment</Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={pay} className="space-y-4">
        <div className="surface-muted p-4">
          <p className="text-xs text-ink-500 dark:text-ink-400">Outstanding amount</p>
          <p className="mt-1 font-display text-2xl font-bold">{inr(outstanding)}</p>
          <Progress className="mt-3" value={fee ? (fee.paidAmount / fee.totalAmount) * 100 : 0} tone="emerald" size="sm" />
        </div>

        <Field label="Amount to pay" hint={`Leave blank to pay the full outstanding amount of ${inr(outstanding)}.`}>
          <Input type="number" min="1" max={outstanding} value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={String(outstanding)} />
        </Field>

        <Field label="Payment mode">
          <Select value={mode} onChange={(event) => setMode(event.target.value)}>
            {['Net Banking', 'UPI', 'Card', 'NEFT', 'Cash', 'Scholarship'].map((item) => <option key={item}>{item}</option>)}
          </Select>
        </Field>

        <p className="text-xs text-ink-400">
          A receipt number is generated automatically and added to the transaction history.
        </p>
      </form>
    </Modal>
  );
}
