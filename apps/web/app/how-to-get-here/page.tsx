export default function HowToGetHere() {
  return (
    <main className="container py-8 space-y-4">
      <h1 className="text-2xl font-bold">איך מגיעים</h1>
      <p>כתובת: רחוב הספורט 10, תל אביב | שעות: א'-ה' 09:00-20:00</p>
      <iframe className="w-full h-96 rounded-xl" src="https://maps.google.com/maps?q=Tel%20Aviv&t=&z=13&ie=UTF8&iwloc=&output=embed" />
    </main>
  );
}
