
import  React, {useState} from 'react';
import axios from 'axios';

function Register() {
    const [form, setForm] = useState({ username: '', password: '', email: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/register', form);
            alert("User registered successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed!");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Username" onChange={(e) => setForm({...form, username: e.target.value})} />
            <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} />
            <input type="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
        </form>
    );
}

export default Register;
