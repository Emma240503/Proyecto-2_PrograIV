package pogra4.be.presentation.home;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping(value = {"/", "/{path:(?!api)[^\\.]*}", "/{path:(?!api)[^\\.]*}/**"})
    public String spa() {
        return "forward:/index.html";
    }
}
