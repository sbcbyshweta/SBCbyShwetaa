import { Link } from "react-router-dom";
import Header from "@/components/Header";
import girlImage from "@/assets/girl.jpg";
import premium from "@/assets/premium.jpg";
import handcrafted from "@/assets/handcrafted.jpg";
import delivery from "@/assets/delivery.jpg";
import payment from "@/assets/payment.jpg";

import {
  ShoppingCart,
  CreditCard,
  Smartphone,
  Truck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import { useRef, useEffect, useState } from "react";

const API_URL = "https://sbc-backend-u2sm.onrender.com";


function ProductCard({ product }: { product: any }) {

  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    addToCart({
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
    });

    alert(`${product.name} added to cart`);
  };

  return (

    <div className="group snap-start min-w-[300px] max-w-[300px] relative rounded-3xl overflow-hidden border border-[#d8c4a3] bg-gradient-to-b from-[#6e563a] to-[#d4af78] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">

      <div className="relative p-4">

        <Link to={`/product/${product._id || product.id}`}>

          <div className="relative h-60 rounded-xl overflow-hidden border border-[#e6dccf] bg-[#f9f4ec]">

            <img
              src={product.image}
              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            />

          </div>

        </Link>

        {product.originalPrice && (

          <div className="absolute top-6 right-6 bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md z-20">

            -
            {Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )}
            %

          </div>

        )}

      </div>

      <div className="px-5 pb-6 text-center">

        <Link to={`/product/${product._id || product.id}`}>

          <h3 className="font-serif text-lg font-semibold mb-2 text-white hover:text-[#fff2cc] transition line-clamp-2">
            {product.name}
          </h3>

        </Link>

        <div className="text-yellow-300 text-sm mb-2">
          {"★".repeat(Math.round(product.rating || 4))}
        </div>

        <div className="flex justify-center items-center gap-2 mb-4">

          <span className="text-white font-bold text-lg">
            ₹{product.price}
          </span>

          {product.originalPrice && (

            <span className="text-gray-200 line-through text-sm">
              ₹{product.originalPrice}
            </span>

          )}

        </div>

        <div className="flex gap-2">

          <Link
            to={`/product/${product._id || product.id}`}
            className="flex-1 py-2 border border-[#f3e1b8] text-white rounded-lg text-sm hover:bg-white hover:text-[#6e563b] transition"
          >
            View
          </Link>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 bg-gradient-to-r from-[#d4af37] to-[#b8962e] text-white rounded-lg flex items-center justify-center gap-2 text-sm hover:opacity-90 transition"
          >
            <ShoppingCart size={16}/>
            Add
          </button>

        </div>

      </div>

    </div>

  );
}


function FeatureCard({ image, title, description }: any) {

  return (

    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 text-center shadow-md border border-[#eadac5] hover:shadow-xl transition">

      <div className="flex justify-center mb-6">

        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#eadac5] shadow-md">

          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />

        </div>

      </div>

      <h3 className="font-serif text-xl font-semibold mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground text-sm">
        {description}
      </p>

    </div>

  );
}


export default function Index() {

  const [products,setProducts] = useState<any[]>([]);

  const dressSlider = useRef<HTMLDivElement>(null);
  const sareeSlider = useRef<HTMLDivElement>(null);


  useEffect(()=>{

    fetch(`${API_URL}/products`)
      .then(res=>res.json())
      .then(data=>{
        setProducts(data);
      })
      .catch(err=>{
        console.error("Error fetching products",err);
      });

  },[]);


  const dressProducts = products.filter(
    (p) => p.category === "kanha-ji-dresses"
  );

  const sareeProducts = products.filter(
    (p) => p.category === "sarees"
  );


  const scrollLeft = (sliderRef: any) => {

    if (sliderRef.current) {

      sliderRef.current.scrollBy({
        left: -350,
        behavior: "smooth",
      });

    }

  };


  const scrollRight = (sliderRef: any) => {

    if (sliderRef.current) {

      sliderRef.current.scrollBy({
        left: 350,
        behavior: "smooth",
      });

    }

  };


  return (

    <div className="min-h-screen bg-[#fcf6ed]">

      <Header />


<section className="relative py-20 overflow-hidden bg-[radial-gradient(circle_at_top,#fff6ea,#fcf6ed,#f3e6d3)]">

<div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">

<div>

<span className="text-primary font-semibold tracking-wider">
✦ Divine Collection ✦
</span>

<h1 className="text-5xl font-serif font-bold mt-4 mb-6 leading-tight text-[#2d2a26]">
Divine Fashion for  
<br/>
Kanha Ji & You
</h1>

<p className="text-lg text-muted-foreground mb-8 max-w-lg">
Explore exquisite handcrafted attire that radiates devotion, elegance and timeless beauty.
</p>

<div className="flex gap-4">

<Link
to="/category/kanha-ji-dresses"
className="px-8 py-3 bg-primary text-white rounded-full shadow-md hover:scale-105 transition"
>
Shop Collection
</Link>

<Link
to="/category/sarees"
className="px-8 py-3 border-2 border-primary text-primary rounded-full hover:bg-primary/10 transition"
>
Explore Sarees
</Link>

</div>

</div>

<div className="rounded-3xl overflow-hidden shadow-2xl h-[520px]">
<img src={girlImage} className="w-full h-full object-cover"/>
</div>

</div>

</section>


<section className="py-24 bg-[#fcf6ed]">

<div className="max-w-6xl mx-auto px-6 text-center">

<h2 className="text-4xl font-serif font-bold mb-8">
About SBC by Shwetaa
</h2>

<p className="mb-16">
  We celebrate timeless tradition and modern elegance through thoughtfully crafted creations at SBC by Shwetaa.
</p>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">

<FeatureCard
image={premium}
title="Premium Quality"
description="Finest fabrics handpicked for luxury and durability"
/>

<FeatureCard
image={handcrafted}
title="Handcrafted"
description="Meticulously crafted with devotion and expertise"
/>

<FeatureCard
image={delivery}
title="Trusted Delivery"
description="Safe and secure delivery to your doorstep"
/>

</div>

</div>

</section>


<section className="py-24">

<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-12">

<h2 className="text-4xl font-serif font-bold mb-4">
Divine Kanha Ji Dresses
</h2>

<p className="text-muted-foreground">
Premium handcrafted dresses for Lord Krishna
</p>

</div>


<div className="flex gap-8 overflow-x-auto px-6">

{dressProducts.map((product)=>(
<ProductCard key={product._id || product.id} product={product}/>
))}

</div>

</div>

</section>


<section className="py-24 bg-white">

<div className="max-w-7xl mx-auto px-6">

<div className="text-center mb-12">

<h2 className="text-4xl font-serif font-bold mb-4">
Exquisite Sarees Collection
</h2>

<p className="text-muted-foreground">
Traditional and modern sarees crafted with premium silk
</p>

</div>


<div className="flex gap-8 overflow-x-auto px-6">

{sareeProducts.map((product)=>(
<ProductCard key={product._id || product.id} product={product}/>
))}

</div>

</div>

</section>


<section
className="py-24 text-white relative"
style={{
backgroundImage:`url(${payment})`,
backgroundSize:"cover",
backgroundPosition:"center",
}}
>

<div className="absolute inset-0 bg-black/40"></div>

<div className="relative max-w-6xl mx-auto px-6 text-center">

<h2 className="text-4xl font-serif font-bold mb-6">
100% Secure Payments
</h2>

<p className="text-white/90 mb-12">
Your transactions are fully encrypted and secure
</p>

<div className="grid grid-cols-2 md:grid-cols-4 gap-6">

{[
{name:"VISA",icon:CreditCard},
{name:"Mastercard",icon:CreditCard},
{name:"UPI",icon:Smartphone},
{name:"COD",icon:Truck},
].map((m)=>{

const Icon=m.icon;

return(

<div className="bg-white/20 backdrop-blur-md rounded-xl py-6">

<Icon className="mx-auto mb-2"/>

<p>{m.name}</p>

</div>

)

})}

</div>

</div>

</section>

</div>

);
}
