// import '../../styles/index.css'
// import { ClientOnly } from './client'

// export function generateStaticParams() {
//   return [{ slug: [''] }]
// }

// export default function Page() {
//   return <ClientOnly />
// }

'use client';
import SearchPage from '../features/Search/SearchPage';

export default function HomePage() {
  return <SearchPage />;
}
