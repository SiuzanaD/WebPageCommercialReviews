import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Layout.scss";

const LoginLayout = ({ children }) => {
  return (
    <div className="login-container">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default LoginLayout;
