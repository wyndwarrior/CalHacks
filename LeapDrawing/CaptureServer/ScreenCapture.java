import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

/**
 * Created by Raymond on 10/4/2014.
 */
public class ScreenCapture {
    public static void save(File file) {
        Robot robot;
        try {
            robot = new Robot();
        } catch (AWTException e) {
            e.printStackTrace();
            return;
        }
        Dimension dimension = Toolkit.getDefaultToolkit().getScreenSize();
        Rectangle screen = new Rectangle(dimension);
        screen = new Rectangle(screen.width/2, screen.height);
        BufferedImage screenshot = robot.createScreenCapture(screen);
        try {
            ImageIO.write(screenshot, "jpg", file);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
