import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {getMovies} from "../services/fakeMovieService";

import Pagination from "./Pagination";
import ListGroup from "./common/listGroup";
import {paginate} from "./utils/paginate";
import {getGenres} from "../services/genreService";
import MoviesTable from "./moviesTable";
import _ from 'lodash';
import '../App.css';
import SearchBox from "./common/search";


class Movies extends Component {

  state = {
    movies: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery:"",
    selectedGenre: null,
    sortColumn: {path: 'title', order: 'asc'},
  };


  async componentDidMount() {
    console.log(await getGenres());
    const {data} = await  getGenres();
    const genres = [{_id: '', name: 'All Genres'}, ...data];
    this.setState({movies: getMovies(), genres: genres});
  }

  handleDelete = (movieId) => {
    this.setState({
      movies: this.state.movies.filter(m => m._id !== movieId)
    });
  };

  handleLike = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    console.log(movie);
    movies[index] = {...movies[index]};
    movies[index].liked = !movies[index].liked;
    this.setState({movies})
  };

  handlePageChange = (page) => {
    this.setState({currentPage: page});
  };

  handleFlterChange = (genre) => {
    this.setState({selectedGenre: genre, searchQuery:"", currentPage: 1})
  };
  handleSearch = query => {
    this.setState({searchQuery:query, selectedGenre:null, currentPage:1});
  };

  handleSort = (sortColumn) => {
    this.setState({sortColumn})
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      selectedGenre,
      searchQuery,
      movies: allMovies
    } = this.state;

    let filtered = allMovies;
    if(searchQuery)
     filtered =
       allMovies.filter(m => m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
       ) ;
       else if (
         selectedGenre && selectedGenre._id ? allMovies.filter(m => m.genre._id === selectedGenre._id) : allMovies
  );

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);
    const movies = paginate(sorted, currentPage, pageSize);

    return {totalCount: filtered.length, data: movies};
  };




  render() {


    const {
      pageSize,
      currentPage,
      sortColumn,
      searchQuery
    } = this.state;


    const {totalCount, data: movies} = this.getPagedData();

    return (

      <div>
        <div className="row">

          <div className="col-md-4 mt-4">

            <ListGroup genres={this.state.genres}
                       selectedItem={this.state.selectedGenre}
                       onFilterChange={this.handleFlterChange}/>
          </div>
          <div className="col-md-8">
            <Link to="/movies/new"  className="btn btn-primary mb-4 mt-4">New Movie <span className="sr-only">(current)</span></Link>
            <p>Showing {totalCount} movies in the database</p>
            <SearchBox value={searchQuery} onChange={this.handleSearch}/>
            <MoviesTable movies={movies}
                         onSort={this.handleSort}
                         onLike={this.handleLike}
                         onDelete={this.handleDelete}
                         sortColumn={sortColumn}
            />

            <Pagination
              itemsCount={totalCount}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={this.handlePageChange}
            />
          </div>
        </div>

      </div>


    );
  }
}

export default Movies;
