use actix_web::{get, web, App, HttpServer, HttpResponse};
use dotenv::dotenv;
use std::{env, error::Error, sync::Arc};
use reqwest;
use csv;
use serde::{Serialize, Deserialize};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    let ip = env::var("IP").unwrap();
    let port = env::var("PORT").unwrap_or_else(|_| "7890".to_string());
    let address = format!("{}:{}", ip, port);
    println!("Starting server on {}", address);

    let cities = load_cities().expect("Failed to load cities");
    let data = web::Data::new(AppState {
        cities: Arc::new(cities),
    });

    HttpServer::new(move || {
        App::new()
            .app_data(data.clone())
            .service(forecast)
            .service(search)
            .service(test)
            .service(daily_forecast)
            .wrap(actix_cors::Cors::permissive())
    })
        .bind(address)?
        .run()
        .await
}

struct AppState {
    cities: Arc<Vec<CityRecord>>,
}
#[derive(Debug, Deserialize, Serialize)]
struct CityRecord {
    city_en: String,
    city_ru: String,
    country: String,
    country_ru: String,
    iso3: String,
    lat: f64,
    lon: f64,
    population: u32,
}


#[get("/api/forecast")]
async fn forecast(query: web::Query<std::collections::HashMap<String, String>>) -> HttpResponse {
    let lat = match query.get("lat") {
        Some(c) => c,
        None => return HttpResponse::BadRequest().body("Missing latitude"),
    };
    let lon = match query.get("lon") {
        Some(c) => c,
        None => return HttpResponse::BadRequest().body("Missing longitude"),
    };
    let language = match query.get("lang") {
        Some(l) => l.as_str(),
        None => "en",
    };

    let api_key = env::var("OW_API_KEY").unwrap();
    let url = format!(
        "https://api.openweathermap.org/data/2.5/forecast?lat={}&lon={}&appid={}&units=metric&lang={}",
        lat, lon, api_key, language
    );
    println!("[DEBUG]Requested forecast for {} {}", lat, lon);

    match reqwest::get(&url).await {
        Ok(resp) => {
            let body = resp.text().await.unwrap_or_else(|_| "{}".to_string());
            HttpResponse::Ok().content_type("application/json").body(body)
        }
        Err(_) => HttpResponse::InternalServerError().body("Error fetching weather"),
    }
}

#[get("/api/daily-forecast")]
async fn daily_forecast(query: web::Query<std::collections::HashMap<String, String>>) -> HttpResponse {
    let lat = match query.get("lat") {
        Some(c) => c,
        None => return HttpResponse::BadRequest().body("Missing latitude"),
    };
    let lon = match query.get("lon") {
        Some(c) => c,
        None => return HttpResponse::BadRequest().body("Missing longitude"),
    };
    let language = match query.get("lang") {
        Some(l) => l.as_str(),
        None => "en",
    };
    let cnt = match query.get("cnt") {
        Some(c) => c,
        None => "12",
    };

    let api_key = env::var("OW_API_KEY").unwrap();
    let url = format!(
        "https://api.openweathermap.org/data/2.5/forecast/daily?lat={}&lon={}&appid={}&units=metric&lang={}&cnt={}",
        lat, lon, api_key, language, cnt
    );
    println!("[DEBUG]Requested daily forecast for {} {}", lat, lon);

    match reqwest::get(&url).await {
        Ok(resp) => {
            let body = resp.text().await.unwrap_or_else(|_| "{}".to_string());
            HttpResponse::Ok().content_type("application/json").body(body)
        }
        Err(_) => {
            println!("[DEBUG]Error fetching weather");
            HttpResponse::InternalServerError().body("Error fetching weather")
        },
    }
}
/*
#[get("/api/pictures")]
*/
#[get("/api/search")]
async fn search(
    data: web::Data<AppState>,
    query: web::Query<std::collections::HashMap<String, String>>
) -> HttpResponse {
    let city = match query.get("q") {
        Some(c) => c.to_lowercase(),
        None => return HttpResponse::BadRequest().body("Missing q - query parameter"),
    };

    let language = match query.get("lang") {
        Some(l) => l.as_str(),
        None => "en",
    };

    println!("[DEBUG] Search request: q='{}', lang='{}'", city, language);

    let results: Vec<_> = data
        .cities
        .iter()
        .filter(|c| {
            c.city_en.to_lowercase().starts_with(&city)
                || c.city_ru.to_lowercase().starts_with(&city)
        })
        .take(5)
        .map(|c| serde_json::json!({
            "city_en": c.city_en,
            "city_ru": c.city_ru,
            "lat": c.lat,
            "lon": c.lon,
            "country": c.country,
            "country_ru": c.country_ru,
        }))
        .collect();

    HttpResponse::Ok().json(results)
}


#[get("/api/test")]
async fn test() -> HttpResponse {
    let cities = load_cities().unwrap();

    let response: Vec<_> = cities.into_iter().take(5).collect();
    HttpResponse::Ok().json(response)
}

fn load_cities() -> Result<Vec<CityRecord>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path("../../data/worldcities.csv")?;
    let mut cities = Vec::new();

    for result in rdr.deserialize() {
        let record: CityRecord = result?;
        cities.push(record);
    }

    Ok(cities)
}