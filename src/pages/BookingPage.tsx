import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Check, CreditCard, Lock, Minus, Plus, ShieldCheck, Ticket, TrainFront, User, X,
} from 'lucide-react';
import { bookingApi } from '@/services/bookingApi';
import { trainApi } from '@/services/trainApi';
import { searchStations } from '@/data/stations';
import { FullScreenSpinner } from '@/components/common/Spinner';
import { ErrorState } from '@/components/common/ErrorState';
import { formatCurrency, formatTime, todayISO } from '@/lib/format';
import type { Booking, FareBreakdown, TrainClassCode } from '@/types';

const STEPS = ['Class', 'Passengers', 'Berth', 'Fare', 'Payment', 'Confirm'] as const;

interface PassengerForm {
  name: string;
  age: string;
  gender: 'M' | 'F' | 'O';
  berth: 'LB' | 'UB' | 'MB' | 'SL' | 'SU' | 'NO';
}

export default function BookingPage() {
  const { trainInstanceId } = useParams<{ trainInstanceId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state ?? {}) as { trainNumber?: string; journeyDate?: string; fromId?: string; toId?: string };

  const [step, setStep] = useState(0);
  const [classCode, setClassCode] = useState<TrainClassCode>('3A');
  const [passengers, setPassengers] = useState<PassengerForm[]>([{ name: '', age: '', gender: 'M', berth: 'NO' }]);
  const [fare, setFare] = useState<FareBreakdown | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const { data: train, isLoading } = useQuery({
    queryKey: ['train', state.trainNumber],
    queryFn: () => trainApi.getTrain(state.trainNumber!),
    enabled: Boolean(state.trainNumber),
  });

  const from = searchStations(state.fromId ?? '', 1)[0] ?? train?.originStation;
  const to = searchStations(state.toId ?? '', 1)[0] ?? train?.destinationStation;
  const journeyDate = state.journeyDate ?? todayISO();

  const fareMutation = useMutation({
    mutationFn: () => bookingApi.fareQuote(trainInstanceId!, classCode, passengers.length),
    onSuccess: (res) => setFare(res.fare),
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingApi.create({
        trainInstanceId: trainInstanceId!,
        trainNumber: state.trainNumber!,
        classCode,
        journeyDate,
        fromStationId: from!.id,
        toStationId: to!.id,
        passengers: passengers.map((p) => ({ name: p.name, age: Number(p.age), gender: p.gender, berthPreference: p.berth })),
      }),
    onSuccess: (b) => {
      setConfirmed(b);
      setStep(5);
    },
  });

  // Fetch fare when reaching the fare step.
  useEffect(() => {
    if (step === 3 && !fare && trainInstanceId) fareMutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (isLoading) return <FullScreenSpinner label="Loading booking…" />;
  if (!train || !from || !to) return <ErrorState title="Booking unavailable" description="This train could not be loaded." className="py-20" />;

  // Confirmation screen
  if (confirmed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="card p-8 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-100 text-success-600">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900">Booking confirmed!</h1>
          <p className="mt-1 text-sm text-neutral-500">Your ticket has been booked. PNR <span className="font-mono font-bold text-neutral-800">{confirmed.pnr}</span></p>
          <div className="mt-6 flex gap-2">
            <Link to={`/bookings/${confirmed.id}`} className="btn-primary flex-1">
              <Ticket className="h-4 w-4" /> View ticket
            </Link>
            <Link to="/bookings" className="btn-secondary flex-1">My bookings</Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedClass = train.classes.find((c) => c.code === classCode) ?? train.classes[0];
  const passengersValid = passengers.every((p) => p.name.trim() && Number(p.age) > 0 && Number(p.age) < 120);

  const next = () => {
    if (step === 1 && !passengersValid) return;
    setStep((s) => Math.min(s + 1, 5));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link to={-1 as never} className="btn-ghost mb-4 -ml-2"><ArrowLeft className="h-4 w-4" /> Back</Link>

      {/* Stepper */}
      <div className="card p-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-1">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:block ${i <= step ? 'text-neutral-800' : 'text-neutral-400'}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? 'bg-primary-500' : 'bg-neutral-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Train summary */}
      <div className="card mt-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <TrainFront className="h-4 w-4 text-primary-600" /> <span className="font-mono">{train.trainNumber}</span> {train.name}
            </div>
            <div className="mt-1 text-xs text-neutral-500">{from.name} → {to.name} · {new Date(journeyDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
          </div>
          <div className="text-right text-xs text-neutral-500">
            {formatTime(train.departureTime)} → {formatTime(train.arrivalTime)}
          </div>
        </div>
      </div>

      {/* Step body */}
      <div className="card mt-3 p-5">
        {step === 0 && (
          <div>
            <h2 className="text-sm font-bold text-neutral-800">Select class</h2>
            <div className="mt-3 space-y-2">
              {train.classes.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setClassCode(c.code)}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left ring-1 transition ${classCode === c.code ? 'bg-primary-50 ring-primary-300' : 'bg-white ring-neutral-200 hover:bg-neutral-50'}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-neutral-800">{c.code} · {c.name}</div>
                    <div className="text-xs text-neutral-500">₹{c.fare.toLocaleString('en-IN')} · {c.availableSeats} seats</div>
                  </div>
                  {classCode === c.code && <Check className="h-5 w-5 text-primary-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-800">Passenger details</h2>
              <button onClick={() => setPassengers([...passengers, { name: '', age: '', gender: 'M', berth: 'NO' }])} className="btn-ghost text-xs">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {passengers.map((p, i) => (
                <div key={i} className="rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"><User className="h-3.5 w-3.5" /> Passenger {i + 1}</span>
                    {passengers.length > 1 && (
                      <button onClick={() => setPassengers(passengers.filter((_, idx) => idx !== i))} className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-error-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <input className="input mt-2" placeholder="Full name" value={p.name} onChange={(e) => update(i, 'name', e.target.value)} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <input className="input" type="number" min={1} max={120} placeholder="Age" value={p.age} onChange={(e) => update(i, 'age', e.target.value)} />
                    <select className="input" value={p.gender} onChange={(e) => update(i, 'gender', e.target.value as 'M' | 'F' | 'O')}>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-sm font-bold text-neutral-800">Berth preference</h2>
            <div className="mt-3 space-y-3">
              {passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-200">
                  <span className="text-sm font-medium text-neutral-700">{p.name || `Passenger ${i + 1}`}</span>
                  <select className="rounded-lg bg-white px-2 py-1.5 text-sm ring-1 ring-neutral-200" value={p.berth} onChange={(e) => update(i, 'berth', e.target.value as 'LB' | 'UB' | 'MB' | 'SL' | 'SU' | 'NO')}>
                    <option value="NO">No preference</option>
                    <option value="LB">Lower</option>
                    <option value="UB">Upper</option>
                    <option value="MB">Middle</option>
                    <option value="SL">Side Lower</option>
                    <option value="SU">Side Upper</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-sm font-bold text-neutral-800">Fare summary</h2>
            {fareMutation.isPending && <div className="mt-3 text-sm text-neutral-500">Calculating fare…</div>}
            {fare && (
              <div className="mt-3 space-y-2">
                <Row label={`Base fare (${passengers.length} pax)`} value={formatCurrency(fare.baseFare)} />
                <Row label="Reservation charge" value={formatCurrency(fare.reservationCharge)} />
                <Row label="Superfast charge" value={formatCurrency(fare.superfastCharge)} />
                {fare.cateringCharge > 0 && <Row label="Catering charge" value={formatCurrency(fare.cateringCharge)} />}
                <Row label="GST" value={formatCurrency(fare.gst)} />
                <div className="my-2 border-t border-dashed border-neutral-200" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-900">Total</span>
                  <span className="text-lg font-bold text-primary-700">{formatCurrency(fare.total)}</span>
                </div>
                <p className="text-[11px] text-neutral-400">Fare computed by the backend. Class: {selectedClass.name}</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-sm font-bold text-neutral-800">Payment</h2>
            <div className="mt-3 rounded-xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700"><CreditCard className="h-4 w-4" /> Demo payment</div>
              <p className="mt-1 text-xs text-neutral-500">No real charge. Confirm to proceed.</p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-400"><Lock className="h-3.5 w-3.5" /> Payments are processed securely on the backend.</div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center">
            <h2 className="text-sm font-bold text-neutral-800">Ready to confirm</h2>
            <p className="mt-1 text-sm text-neutral-500">Review and confirm your booking.</p>
            <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-left text-sm">
              <Row label="Train" value={`${train.trainNumber} ${train.name}`} />
              <Row label="Class" value={selectedClass.name} />
              <Row label="Passengers" value={String(passengers.length)} />
              <Row label="Total" value={formatCurrency(fare?.total ?? 0)} />
            </div>
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-4 flex items-center justify-between">
        <button onClick={back} disabled={step === 0 || bookMutation.isPending} className="btn-secondary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < 5 ? (
          <button onClick={next} disabled={(step === 1 && !passengersValid) || fareMutation.isPending} className="btn-primary">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => bookMutation.mutate()} disabled={bookMutation.isPending} className="btn-primary">
            {bookMutation.isPending ? 'Booking…' : 'Confirm booking'} <ShieldCheck className="h-4 w-4" />
          </button>
        )}
      </div>

      {bookMutation.isError && (
        <div className="mt-3 rounded-xl bg-error-50 p-3 text-sm text-error-700">
          Booking failed. {(bookMutation.error as Error)?.message}
        </div>
      )}
    </div>
  );

  function update<K extends keyof PassengerForm>(i: number, key: K, value: PassengerForm[K]) {
    setPassengers((ps) => ps.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-800">{value}</span>
    </div>
  );
}
