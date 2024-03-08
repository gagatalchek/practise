import Board from "./board/board";

const MainPage = () => {
  return (
    <div className="w-[36.2rem] h-[36.2rem] flex items-center justify-center ">
      <div className="box"></div>
      {/* <Board /> */}
    </div>
  );
};

export default MainPage;

const human = (name: string) => {
  return function (age: number) {
    console.log(name + " " + age);
  };
};

const foo = human("Bobby");
foo(21);

const baz = human("Mark");

foo(32);

baz(44);
