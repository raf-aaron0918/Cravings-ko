"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { formatPeso } from '@/lib/currency';

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: string;
  isFeatured: boolean;
  outOfStock?: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{
    rating: number | null;
    feedback: string | null;
  }>;
};

const CATEGORIES = ['Cookies', 'Cheese Sticks', 'Lumpia'];
const CATEGORY_LABELS: Record<string, string> = {
  Cookies: 'Cookies',
  'Cheese Sticks': 'Cheese Sticks',
  Lumpia: 'Lumpia',
  Desserts: 'Cookies',
  Snacks: 'Cheese Sticks',
  Drinks: 'Cheese Sticks',
  Meals: 'Lumpia',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Cookies',
  isFeatured: false,
  outOfStock: false,
};

export default function AdminMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [openFeedbackId, setOpenFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let active = true;

    const loadItems = async () => {
      const res = await fetch('/api/menu', { credentials: 'include' });
      if (!active) return;

      if (res.ok) {
        const data = await res.json();
        setItems(
          data.map((item: MenuItem) => ({
            ...item,
            category: CATEGORY_LABELS[item.category] ?? item.category,
            outOfStock: item.outOfStock ?? false,
          }))
        );
      }
      else router.push('/admin/login');
    };

    void loadItems();

    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('isFeatured', String(form.isFeatured));
    formData.append('outOfStock', String(form.outOfStock));
    if (file) formData.append('file', file);

    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/menu/${editId}` : '/api/menu';

    const res = await fetch(url, {
      method,
      body: formData,
      credentials: 'include',
    });

    setLoading(false);
    if (res.ok) {
      setMessage(editId ? 'Item updated!' : 'Item added!');
      setForm(EMPTY_FORM);
      setFile(null);
      setEditId(null);
      setOpenFeedbackId(null);
      const itemsRes = await fetch('/api/menu', { credentials: 'include' });
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(
          data.map((item: MenuItem) => ({
            ...item,
            category: CATEGORY_LABELS[item.category] ?? item.category,
            outOfStock: item.outOfStock ?? false,
          }))
        );
      }
    } else {
      const data = await res.json().catch(() => null);
      setMessage(data?.error || 'Something went wrong.');
    }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (item: MenuItem) => {
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: CATEGORY_LABELS[item.category] ?? item.category,
      isFeatured: item.isFeatured,
      outOfStock: item.outOfStock ?? false,
    });
    setFile(null);
    setEditId(item.id);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE', credentials: 'include' });
    const res = await fetch('/api/menu', { credentials: 'include' });
    if (res.ok) setItems(await res.json());
  };


  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>{editId ? 'Edit Item' : 'Manage Menu'}</h1>
        <Link href="/admin/dashboard" className={styles.backBtn}>Back to Dashboard</Link>
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.formHeader}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Hide Add Form' : 'Add Item'}
        </button>
      </div>

      {showForm && !editId && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Add Item</h2>
          <div className={styles.formGrid}>
            <label>Item Name
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </label>
            <label>Category
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Price (PHP)
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
            </label>
            <label>Item Image (Upload)
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <label style={{ marginTop: '1rem' }}>Description
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </label>
          <div className={styles.formActions}>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Item'}</button>
          </div>
        </form>
      )}

      {editId && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Edit Item</h2>
          <div className={styles.formGrid}>
            <label>Item Name
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </label>
            <label>Category
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(category => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Price (PHP)
              <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
            </label>
            <label>Item Image (Upload)
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.outOfStock}
                onChange={e => setForm(p => ({ ...p, outOfStock: e.target.checked }))} />
              <span>Out of Stock</span>
            </label>
          </div>
          <label style={{ marginTop: '1rem' }}>Description
            <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required />
          </label>
          <div className={styles.formActions}>
            <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Update Item'}</button>
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(EMPTY_FORM);
                setFile(null);
              }}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h2 className={styles.tableTitle}>All Menu Items ({items.length})</h2>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
              <th>Feedback</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td data-label="Name">{item.name}</td>
                <td data-label="Category"><span className={styles.catTag}>{item.category}</span></td>
                <td data-label="Price">{formatPeso(item.price)}</td>
                <td data-label="Stock">
                  <span className={`${styles.stockTag} ${item.outOfStock ? styles.stockOut : styles.stockIn}`}>
                    {item.outOfStock ? 'Out of Stock' : 'Available'}
                  </span>
                </td>
                <td data-label="Rating">{item.rating ? `★ ${item.rating.toFixed(1)} (${item.reviewCount})` : 'No reviews'}</td>
                <td data-label="Feedback">
                  {item.reviews && item.reviews.length > 0 ? (
                    <div className={styles.feedbackCell}>
                      <button
                        type="button"
                        className={styles.feedbackBtn}
                        onClick={() => setOpenFeedbackId(current => (current === item.id ? null : item.id))}
                      >
                        {openFeedbackId === item.id ? 'Hide Feedback' : `View Feedback (${item.reviews.length})`}
                      </button>
                      {openFeedbackId === item.id && (
                        <div className={styles.feedbackList}>
                          {item.reviews.map((review, index) => (
                            <div key={`${item.id}-review-${index}`} className={styles.feedbackItem}>
                              <span className={styles.feedbackRating}>
                                {review.rating ? `★ ${review.rating}/5` : 'No rating'}
                              </span>
                              <span className={styles.feedbackText}>
                                {review.feedback?.trim() ? review.feedback : 'No written feedback'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className={styles.feedbackEmpty}>No feedback yet</span>
                  )}
                </td>
                <td data-label="Actions" className={styles.actions}>
                  <button onClick={() => handleEdit(item)} className={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', fontStyle: 'italic' }}>
                  No menu items yet. Add some above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
