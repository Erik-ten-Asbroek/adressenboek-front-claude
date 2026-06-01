import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import AddressList from './components/AddressList';
import AddressForm from './components/AddressForm';
import LoginPage from './components/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAddresses } from './hooks/useAddresses';

function ProtectedApp() {
  const {
    addresses,
    loading,
    addAddress,
    editAddress,
    removeAddress,
    getAddress,
    searchAddresses
  } = useAddresses();

  const handleSubmit = async (id, formData) => {
    if (id) {
      await editAddress(id, formData);
    } else {
      await addAddress(formData);
    }
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <AddressList
                addresses={addresses}
                loading={loading}
                onDelete={removeAddress}
                searchAddresses={searchAddresses}
              />
            }
          />
          <Route
            path="/add"
            element={<AddressForm onSubmit={handleSubmit} />}
          />
          <Route
            path="/edit/:id"
            element={<AddressForm onSubmit={handleSubmit} getAddress={getAddress} />}
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ProtectedApp />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
