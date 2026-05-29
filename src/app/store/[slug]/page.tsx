import { redirect } from 'next/navigation';

export default function OldStoreRedirect({ params }: { params: { slug: string } }) {
  // Permanently redirect from the old /store URL to the new /shop URL
  redirect(`/shop/${params.slug}`);
}
