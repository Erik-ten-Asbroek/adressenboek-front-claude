import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import AddressList from './components/AddressList';
import AddressForm from './components/AddressForm';
import { useAddresses } from './hooks/useAddresses';

function App() {
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
    <div className="app">
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
    </div>
  );
}

export default App;
