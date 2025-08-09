import React, { useState } from "react";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LeaveReviewModal: React.FC<LeaveReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [text, setText] = useState("");
  const [allowPublish, setAllowPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, allow_publish: allowPublish }),
      });
      const data = await res.json();
      if (data.success) {
        setText("");
        setAllowPublish(false);
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Помилка відправки відгуку");
      }
    } catch (e) {
      setError("Помилка мережі");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="bg-white p-6 w-full max-w-md mx-auto">
      <button
        className="absolute top-2 right-2 text-gray-500"
        onClick={onClose}
        type="button"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold mb-4">Залишити відгук</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border border-gray-300 rounded p-2 mb-4"
          rows={4}
          placeholder="Ваш відгук..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <label className="flex items-center mb-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={allowPublish}
            onChange={(e) => setAllowPublish(e.target.checked)}
          />
          Даю згоду на публікацію мого відгуку
        </label>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Відправка..." : "Відправити"}
        </button>
      </form>
    </div>
  );
};
