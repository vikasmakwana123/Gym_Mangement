import React from "react";
import NotificationsPanel from "../components/NotificationsPanel";

const Gym_HomePage = () => {
  return (
    <div className="w-full overflow-x-hidden">
      {}
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full">
        <img
          src="/gym_homepage.jpg"
          alt="Gym Home"
          className="w-full h-full object-cover"
        />

        {}
        <h1 className="absolute bottom-6 left-1/2 -translate-x-1/2 
          text-2xl sm:text-3xl md:text-5xl 
          font-bold text-amber-50 bg-black/60 
          px-4 sm:px-6 py-2 sm:py-3 
          rounded-lg text-center whitespace-nowrap">
          Welcome to VM Fitness
        </h1>
      </div>

      {}
      <section className="py-10 sm:py-12 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
          Why Choose VM Fitness?
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600 text-sm sm:text-base leading-relaxed">
          VM Fitness is a premium gym management and training facility focused on
          strength, endurance, and transformation. We provide professional
          trainers, modern equipment, and personalized workout plans to help
          you achieve your fitness goals efficiently and safely.
        </p>
      </section>

      {}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 
        gap-6 px-4 sm:px-6 bg-gray-100 pb-12">
        
        <div className="p-6 rounded-xl shadow-md text-center bg-gray-100">
          <img
            src="/coach.jpg"
            alt="coaches"
            loading="lazy"
            className="w-full h-[200px] sm:h-[250px] object-cover mb-3 rounded-2xl"
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            Expert Trainers
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Certified coaches with experience in strength training, fat loss,
            and calisthenics.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md text-center bg-gray-100">
          <img
            src="/gym.webp"
            alt="gym equipmnets"
            loading="lazy"
            className="w-full h-[200px] sm:h-[250px] object-cover mb-3 rounded-2xl"
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            Modern Equipments
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            High-quality machines and free weights for all training styles.
          </p>
        </div>

        <div className="p-6 rounded-xl shadow-md text-center bg-gray-100">
          <img
            src="/Membership.png"
            alt="Membership"
            loading="lazy"
            className="w-full h-[200px] sm:h-[250px] object-cover mb-3 rounded-2xl"
          />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            Flexible Memberships
          </h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Monthly, quarterly, and yearly plans with personal training options.
          </p>
        </div>
      </section>

      {}
      <section className="py-10 sm:py-12 px-4 sm:px-6 bg-gray-100">
        <div className="max-w-3xl mx-auto">
          <NotificationsPanel />
        </div>
      </section>

      {}
      <footer className="bg-gray-100 text-black border-t-gray-200 border-t-2 text-center py-6 text-sm sm:text-base">
        <p>&copy; {new Date().getFullYear()} VM Fitness. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Gym_HomePage;
