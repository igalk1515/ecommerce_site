export function WhatsAppButton() {
  const msg = encodeURIComponent("שלום, אשמח לקבל מידע על מוצרים בחנות.");
  return (
    <a className="fixed bottom-6 left-6 bg-green-500 text-white rounded-full px-4 py-3 shadow-lg" href={`https://wa.me/972501234567?text=${msg}`} target="_blank">
      וואטסאפ
    </a>
  );
}
