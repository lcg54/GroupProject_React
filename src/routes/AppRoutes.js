import { Route, Routes } from "react-router-dom";

import ProductDetail from './../pages/ProductDetail';



function App() {
    return(
        <Routes>
            <Route path='/product/detail/:id' element={ <ProductDetail /> } />

        </Routes>


    );
}

export default App;