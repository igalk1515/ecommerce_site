export default function SuccessPage({ searchParams }: { searchParams: { orderId: string } }) {
  return <main className="container py-8"><h1 className="text-2xl font-bold">ההזמנה התקבלה</h1><p>מספר הזמנה: {searchParams.orderId}</p></main>;
}
