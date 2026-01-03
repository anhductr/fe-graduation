import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import SearchResult from "../components/SearchResult";
export default function SearchResultPage() {
  return (
    <div className="component-container">
      <Navbar></Navbar>
      <SearchResult></SearchResult>
      <Footer></Footer>
    </div>
  );
}

