import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container py-4 flex gap-4 items-center">
        <Link href="/" className="font-bold text-xl">ספורט בעיר</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/products">מוצרים</Link>
          <Link href="/about">אודות</Link>
          <Link href="/contact">יצירת קשר</Link>
          <Link href="/cart">עגלה</Link>
          <Link href="/admin">ניהול</Link>
        </nav>
      </div>
    </header>
  );
}
