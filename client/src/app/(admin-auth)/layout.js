import "@/assets/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminAuthLayout({ children }) {
    return (
        <div data-startbar="dark" data-bs-theme="light">
            {children}
        </div>
    );
}