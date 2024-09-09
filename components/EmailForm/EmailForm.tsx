import { useState } from "react";
import { useMutation } from "react-query";

import styles from "./EmailForm.module.scss";

interface FormData {
  email: string;
}

export function EmailForm() {
  const [email, setEmail] = useState("");

  const mutation = useMutation<Response, Error, FormData>((formData) => {
    const formBody = `email=${encodeURIComponent(formData.email)}`;

    return fetch(
      "https://app.loops.so/api/newsletter-form/cls6bu7f201hanqcmypl8vqe5",
      {
        method: "POST",
        body: formBody,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate({ email });
  };

  return (
    <div className={styles.EmailForm}>
      {(mutation.isIdle || mutation.isLoading) && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required={true}
          />
          <button type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Joining..." : "Join Newsletter"}
          </button>
        </form>
      )}
      {mutation.isError && (
        <div className="message">
          Error:{" "}
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Unknown error"}
        </div>
      )}
      {mutation.isSuccess && (
        <div className="message">~ Thanks for signing up! ~</div>
      )}
      <p>Get updates about my projects & stuff.</p>
    </div>
  );
}
