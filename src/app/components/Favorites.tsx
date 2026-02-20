import { Star, Heart, MapPin, Users, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Resource } from "../types";
import { store } from "../store";

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Resource[]>([]);

  useEffect(() => {
    store.getResources()
      .then(data => {
        // Simulate favorites by picking the first 3 resources
        setFavorites(data.slice(0, 3));
      })
      .catch(err => console.error(err));
  }, []);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter(f => f.id !== id));
  };

  const resourceTypeLabel = (type: string) => {
    switch (type) {
      case 'study-room': return 'Study Room';
      case 'vr-lab': return 'VR Lab';
      case 'tutoring-center': return 'Tutoring Center';
      default: return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">My Favorites</h1>
        <p className="text-muted-foreground">
          Quick access to your preferred campus resources
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 border border-border text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">No favorites yet</h3>
          <p className="text-muted-foreground mb-4">
            Start adding resources to your favorites for quick access
          </p>
          <a
            href="/student"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Resources
          </a>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md p-4 border border-border mb-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                You have <strong>{favorites.length}</strong> favorite resource{favorites.length !== 1 ? 's' : ''}
              </p>
              <button className="text-sm text-primary hover:underline">
                Add More
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-xl shadow-md p-5 border border-border hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                    <h3 className="text-lg mb-1">{resource.name}</h3>
                    <span className="inline-block text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full">
                      {resourceTypeLabel(resource.type)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFavorite(resource.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from favorites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{resource.building}, Floor {resource.floor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Capacity: {resource.capacity} people</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Current Utilization</span>
                    <span>{resource.utilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        resource.status === 'over-utilized' ? 'bg-red-500' :
                        resource.status === 'under-utilized' ? 'bg-green-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${resource.utilization}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {resource.amenities.slice(0, 3).map((amenity, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {resource.amenities.length > 3 && (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        +{resource.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => navigate('/student')}
                  className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg mb-2 text-blue-900">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Add resources to favorites for faster booking access</li>
              <li>• Check utilization levels to find the best time to book</li>
              <li>• Browse all resources to discover new study spaces and labs</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
