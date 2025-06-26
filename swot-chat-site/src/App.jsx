import { SwotAIChat } from './components/SwotAIChat.jsx'
import './App.css'

function App() {
  // Dados simulados do lead que viria do formulário externo
  const leadData = {
    name: "Visitante",
    email: "",
    phone: "",
    company: "",
    message: ""
  };

  return (
    <div className="min-h-screen">
      <SwotAIChat leadData={leadData} />
    </div>
  )
}

export default App

