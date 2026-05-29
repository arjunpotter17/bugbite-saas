const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    button.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(1px)" },
        { transform: "translateY(0)" }
      ],
      { duration: 160, easing: "ease-out" }
    );
  });
});
